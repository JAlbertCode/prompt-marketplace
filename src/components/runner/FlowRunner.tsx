'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { PromptFlow, Prompt, FlowStep } from '@/types';
import { useCreditStore } from '@/store/useCreditStore';
import { usePromptStore } from '@/store/usePromptStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { executePrompt } from '@/lib/sonarApi';
import { generateImage } from '@/lib/imageApi';
import { downloadTextFile, generateFilename } from '@/lib/downloadHelpers';
import { formatUserInputs } from '@/lib/promptHelpers';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import StepVisualizer from './StepVisualizer';
import ResultDisplay from './ResultDisplay';
import AuthCheck from '@/components/auth/AuthCheck';
import { useSession } from 'next-auth/react';

interface FlowRunnerProps {
  flow: PromptFlow;
  onReturn: () => void;
}

interface FlowResult {
  stepId: string;
  stepTitle: string;
  promptId: string;
  promptTitle: string;
  model: string;
  output: string;
  imageUrl?: string;
  isActive: boolean;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
  hasImageCapability?: boolean;
}

const FlowRunner: React.FC<FlowRunnerProps> = ({ flow, onReturn }) => {
  const router = useRouter();
  const { credits, deductCredits } = useCreditStore();
  const promptStore = usePromptStore();
  const favoriteStore = useFavoriteStore();
  const { data: session } = useSession();
  
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [results, setResults] = useState<FlowResult[]>([]);
  const [showCreditWarning, setShowCreditWarning] = useState(credits < flow.totalCreditCost);
  
  // Create a map of prompts for easy lookup
  const promptsMap: Record<string, Prompt> = {};
  flow.steps.forEach(step => {
    const prompt = promptStore.getPrompt?.(step.promptId);
    if (prompt) {
      promptsMap[step.promptId] = prompt;
    }
  });
  
  // Create a list of user inputs needed for the flow
  const flowInputFields = React.useMemo(() => {
    const userInputs: { 
      id: string; 
      label: string; 
      placeholder: string; 
      required?: boolean;
      type?: 'text' | 'textarea' | 'select' | 'image';
      options?: string[];
      stepIndex: number;
      targetInputId: string;
    }[] = [];
    
    // Go through each step and find user inputs
    flow.steps.forEach((step, stepIndex) => {
      const prompt = promptsMap[step.promptId];
      if (!prompt) return;
      
      // Check each input mapping to see if it's user provided
      step.inputMappings.forEach(mapping => {
        if (mapping.sourceType === 'user') {
          // Find the original input field from the prompt
          const originalField = prompt.inputFields.find(
            field => field.id === mapping.targetInputId
          );
          
          if (!originalField) return;
          
          // Add this to our list of needed user inputs
          userInputs.push({
            id: mapping.userInputId || originalField.id,
            label: originalField.label,
            placeholder: originalField.placeholder,
            required: originalField.required,
            type: originalField.type,
            options: originalField.options,
            stepIndex,
            targetInputId: mapping.targetInputId
          });
        }
      });
    });
    
    return userInputs;
  }, [flow.steps, promptsMap]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleViewPrompt = (promptId: string) => {
    // Navigate to the prompt run page
    router.push(`/run/${promptId}?type=prompt`);
  };
  
  const handleFavoritePrompt = (promptId: string) => {
    if (!session) {
      toast.error("Please sign in to save favorites");
      return;
    }
    
    // Add prompt to favorites
    favoriteStore.toggleFavorite(promptId);
    toast.success('Prompt added to favorites');
  };
  
  const runFlow = async () => {
    // Check if all required fields are filled
    const missingFields = flowInputFields
      .filter(field => field.required && !inputValues[field.id])
      .map(field => field.label);
      
    if (missingFields.length > 0) {
      toast.error(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Check if user has enough credits
    if (credits < flow.totalCreditCost) {
      toast.error(`Not enough credits to run this flow. Needed: ${flow.totalCreditCost}, Available: ${credits}`);
      return;
    }
    
    try {
      setIsRunning(true);
      
      // Initialize results with all steps marked as inactive
      const initialResults = flow.steps.map((step) => {
        const prompt = promptsMap[step.promptId];
        return {
          stepId: step.id,
          stepTitle: step.title || (prompt ? prompt.title : 'Unknown Step'),
          promptId: step.promptId,
          promptTitle: prompt ? prompt.title : 'Unknown Prompt',
          model: prompt ? prompt.model : 'unknown',
          output: '',
          isActive: false,
          isComplete: false,
          isError: false,
          hasImageCapability: prompt?.capabilities?.includes('image') || false
        };
      });
      
      setResults(initialResults);
      
      // Run each step in order
      for (let i = 0; i < flow.steps.length; i++) {
        const step = flow.steps[i];
        const prompt = promptsMap[step.promptId];
        
        if (!prompt) {
          throw new Error(`Prompt for step ${i + 1} not found`);
        }
        
        // Mark this step as active
        setCurrentStepIndex(i);
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, isActive: true } : r
        ));
        
        // Prepare input for this step
        const stepInput: Record<string, string> = {};
        
        for (const mapping of step.inputMappings) {
          if (mapping.sourceType === 'user') {
            // Get input directly from user
            const userInputId = mapping.userInputId || mapping.targetInputId;
            stepInput[mapping.targetInputId] = inputValues[userInputId] || '';
          } else if (mapping.sourceType === 'previousStep' && mapping.sourceStepId && mapping.sourceOutputPath) {
            // Get input from a previous step's output
            const sourceStepResult = results.find(r => r.stepId === mapping.sourceStepId);
            if (sourceStepResult && sourceStepResult.output) {
              // For MVP, we'll just use the entire output as the input
              // In a more complex implementation, we'd parse the output based on the path
              stepInput[mapping.targetInputId] = sourceStepResult.output;
            }
          }
        }
        
        try {
          // Format inputs for the prompt
          const formattedInputs = formatUserInputs(prompt.inputFields, stepInput);
          
          // Execute the prompt
          let output = '';
          let imageUrl = '';
          
          // Determine prompt capabilities
          const hasImageCapability = prompt.capabilities?.includes('image');
          const hasTextCapability = prompt.capabilities?.includes('text') || 
                                   (!prompt.capabilities?.includes('image'));
          
          // Generate text output if the prompt isn't image-only
          if (hasTextCapability) {
            output = await executePrompt(
              prompt.systemPrompt,
              formattedInputs,
              prompt.model
            );
          }
          
          // Generate image if this prompt has image capability
          if (hasImageCapability && prompt.imageModel) {
            try {
              // Create a better image prompt - use the text output if available
              let imagePromptText = '';
              
              if (output) {
                // If we have text output, use that as the image prompt
                imagePromptText = `Create an image that represents: ${output.substring(0, 500)}`;
              } else {
                // Fallback to combining all inputs
                const inputValues = Object.values(formattedInputs).filter(Boolean);
                const combinedInputs = inputValues.join('. ');
                imagePromptText = `Create a detailed image of: ${combinedInputs}`;
              }
              
              console.log(`Generating image with prompt: ${imagePromptText.substring(0, 100)}...`);
              
              // Generate the image
              imageUrl = await generateImage(
                imagePromptText,
                prompt.imageModel
              );
            } catch (imageError) {
              console.error('Image generation error:', imageError);
              // We don't fail the whole step if just the image fails
              // but we do log the error
            }
          }
          
          // Update the result for this step
          setResults(prev => prev.map((r, idx) => 
            idx === i ? { 
              ...r, 
              output,
              imageUrl,
              isComplete: true 
            } : r
          ));
          
          // Deduct credits for this step
          deductCredits(prompt.creditCost, `Flow step ${i + 1}`, flow.id);
          
        } catch (error) {
          console.error(`Error in flow step ${i + 1}:`, error);
          
          // Mark this step as failed
          setResults(prev => prev.map((r, idx) => 
            idx === i ? { 
              ...r, 
              isError: true,
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            } : r
          ));
          
          // Stop execution
          throw new Error(`Flow execution failed at step ${i + 1}`);
        }
        
        // Artificial delay to prevent rate limits and show step progression
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Flow completed successfully
      toast.success('Flow executed successfully!');
      setCurrentStepIndex(-1); // No active step when done
      
    } catch (error) {
      console.error('Flow execution error:', error);
      toast.error('Flow execution failed');
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleDownload = (result: FlowResult) => {
    if (!result.output) return;
    
    const filename = generateFilename(`${flow.title}-step-${result.stepTitle}`, 'txt');
    downloadTextFile(result.output, filename);
    toast.success('Output downloaded');
  };
  
  const renderInputField = (field: typeof flowInputFields[0]) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={inputValues[field.id] || ''}
            onChange={handleInputChange}
            required={field.required}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
          />
        );
        
      case 'select':
        return (
          <select
            id={field.id}
            name={field.id}
            value={inputValues[field.id] || ''}
            onChange={handleInputChange}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            value={inputValues[field.id] || ''}
            onChange={handleInputChange}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        );
    }
  };

  const contentBeforeExecution = (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Flow Inputs</h3>
      
      {/* Flow step overview */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">This flow will run these prompts:</h4>
        <div className="space-y-3">
          {flow.steps.map((step, index) => {
            const prompt = promptsMap[step.promptId];
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-medium text-xs mr-2">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.title || (prompt ? prompt.title : `Step ${index + 1}`)}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span>Using prompt:</span>
                    <span className="ml-1 font-medium text-indigo-600">{prompt ? prompt.title : 'Unknown'}</span>
                    <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{prompt ? prompt.model : 'unknown'}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {prompt ? `${prompt.creditCost} credits` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); runFlow(); }} className="space-y-6">
        {/* Group input fields by prompt/step */}
        {flow.steps.map((step, stepIndex) => {
          const prompt = promptsMap[step.promptId];
          if (!prompt) return null;
          
          // Find all input fields that are associated with this step
          const stepInputFields = flowInputFields.filter(field => field.stepIndex === stepIndex);
          
          if (stepInputFields.length === 0) return null;
          
          return (
            <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-medium text-xs mr-2">
                  {stepIndex + 1}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{step.title || prompt.title}</h4>
                  <div className="text-xs text-gray-500">
                    Input fields for this step
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {stepInputFields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label 
                      htmlFor={field.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}{field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {renderInputField(field)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {showCreditWarning && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Not enough credits! You need {flow.totalCreditCost} credits but have {credits} credits.
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <div>
            <span className={`text-sm ${credits < flow.totalCreditCost ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
              Total cost: <span className="font-semibold">{flow.totalCreditCost} credits</span>
              {credits < flow.totalCreditCost ? ` (You have: ${credits})` : ''}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onReturn}
            >
              Back
            </Button>
            
            <AuthCheck>
              <Button
                type="submit"
                disabled={isRunning || credits < flow.totalCreditCost}
              >
                {isRunning ? (
                  <span className="flex items-center">
                    <LoadingIndicator size="sm" className="mr-2" />
                    Running Flow...
                  </span>
                ) : (
                  'Execute Flow'
                )}
              </Button>
            </AuthCheck>
          </div>
        </div>
      </form>
    </div>
  );

  const contentAfterExecution = (
    <div className="space-y-6">
      {/* Flow Execution View */}
      <StepVisualizer 
        steps={flow.steps.map((step, i) => {
          const prompt = promptsMap[step.promptId];
          return {
            id: step.id,
            title: step.title || (prompt ? prompt.title : `Step ${i + 1}`),
            promptId: step.promptId,
            promptTitle: prompt ? prompt.title : 'Unknown Prompt',
            model: prompt ? prompt.model : 'unknown',
            isActive: i === currentStepIndex,
            isComplete: results[i]?.isComplete || false,
            isError: results[i]?.isError || false
          };
        })}
        onViewPrompt={handleViewPrompt}
        onFavoritePrompt={handleFavoritePrompt}
      />
      
      <div className="space-y-4">
        {results.map((result, i) => (
          <ResultDisplay 
            key={result.stepId}
            result={{
              ...result,
              promptTitle: promptsMap[result.promptId]?.title || 'Unknown Prompt',
              model: promptsMap[result.promptId]?.model || 'unknown',
              hasImageCapability: promptsMap[result.promptId]?.capabilities?.includes('image') || false
            }}
            stepNumber={i + 1}
            onDownload={() => handleDownload(result)}
            onViewPrompt={handleViewPrompt}
          />
        ))}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setResults([]);
            setCurrentStepIndex(-1);
          }}
        >
          Try Again
        </Button>
        
        <Button
          variant="outline"
          onClick={onReturn}
        >
          Back
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{flow.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{flow.description}</p>
        
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Flow ({flow.steps.length} steps)
          </span>
          <span className="ml-2 text-sm text-gray-500">
            Total cost: <span className="font-semibold">{flow.totalCreditCost} credits</span>
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {results.length === 0 ? contentBeforeExecution : contentAfterExecution}
      </div>
    </div>
  );
};

export default FlowRunner;