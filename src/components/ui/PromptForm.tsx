import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Prompt, InputField } from '@/types';
import { executePrompt } from '@/lib/sonarApi';
import { generateImage } from '@/lib/imageApi';
import { formatUserInputs } from '@/lib/promptHelpers';
import { downloadTextFile, generateFilename } from '@/lib/downloadHelpers';
import { useCreditStore } from '@/store/useCreditStore';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ImageDisplay from '@/components/ui/ImageDisplay';

interface PromptFormProps {
  prompt: Prompt;
  onReturn: () => void;
}

const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  onReturn,
}) => {
  const { credits, deductCredits } = useCreditStore();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  // Determine prompt capabilities
  const hasImageCapability = prompt.capabilities?.includes('image');
  const hasTextCapability = prompt.capabilities?.includes('text');
  
  useEffect(() => {
    // Check if credits are insufficient and show warning
    setShowCreditWarning(credits < prompt.creditCost);
  }, [credits, prompt.creditCost]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setOutput(null);
    setImageUrl(null);
    setError(null);
    
    // Check if user has enough credits
    if (credits < prompt.creditCost) {
      toast.error('Not enough credits to run this prompt');
      return;
    }
    
    // Check required fields
    const missingFields = prompt.inputFields
      .filter(field => field.required && !inputValues[field.id])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      setError(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format user inputs for the API
      const formattedInputs = formatUserInputs(prompt.inputFields, inputValues);
      
      let success = false;
      
      // Handle image-only prompts separately
      if (hasImageCapability && !hasTextCapability) {
        try {
          // For image-only prompts, create a basic prompt from the first input
          const promptText = Object.values(formattedInputs)[0] || "";
          // Keep it very simple - just the basic topic
          const imagePrompt = `Image of ${promptText}`;
          
          console.log('Generating image with prompt:', imagePrompt);
          
          // Call the OpenAI DALL-E API
          const imgUrl = await generateImage(
            imagePrompt,
            'dall-e-3'
          );
          
          // Set the image URL
          setImageUrl(imgUrl);
          success = true;
        } catch (imgErr) {
          console.error('Error generating image:', imgErr);
          toast.error('Failed to generate image');
          throw imgErr;
        }
      } 
      // Handle text-based prompts (with or without image)
      else if (hasTextCapability) {
        try {
          // Call the Sonar API for text generation
          const textResult = await executePrompt(
            prompt.systemPrompt,
            formattedInputs,
            prompt.model
          );
          
          // Set the text output
          setOutput(textResult);
          success = true;
          
          // If this prompt also has image capability, generate an image
          if (hasImageCapability && prompt.imageModel) {
            try {
              // Ultra simple prompt to avoid errors
              const promptText = Object.values(formattedInputs)[0] || "";
              const imagePrompt = `Image of ${promptText}`;
              
              console.log('Generating image with prompt:', imagePrompt);
              
              // Call the OpenAI DALL-E API
              const imgUrl = await generateImage(
                imagePrompt,
                'dall-e-3'
              );
              
              // Set the image URL
              setImageUrl(imgUrl);
            } catch (imgErr) {
              console.error('Error generating image:', imgErr);
              toast.error('Failed to generate image, but text was generated successfully');
            }
          }
        } catch (txtErr) {
          console.error('Error generating text:', txtErr);
          toast.error('Failed to generate text');
          throw txtErr;
        }
      }
      
      // Check if we succeeded
      if (!success) {
        throw new Error('No generation capabilities available');
      }
      
      // Deduct credits
      deductCredits(prompt.creditCost, "Run prompt", prompt.id);
      
      // Show success notification
      toast.success(`Prompt executed! -${prompt.creditCost} credits`);
      
      // Toggle to show output
      setShowOutput(true);
    } catch (err) {
      console.error('Error executing prompt:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to execute prompt');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!output) return;
    
    const filename = generateFilename(prompt.title, 'txt');
    downloadTextFile(output, filename);
    toast.success('Output downloaded successfully');
  };
  
  const handleRegenerateImage = async () => {
    // Check if we have an image capability and model
    if (!hasImageCapability) return;
    
    try {
      setIsLoading(true);
      
      // Check if user has enough credits for regeneration
      const regenerationCost = Math.ceil(prompt.creditCost / 2);
      
      if (credits < regenerationCost) {
        toast.error(`Not enough credits to regenerate image. Needs ${regenerationCost} credits.`);
        return;
      }
      
      // Use the simplest possible prompt
      const promptText = Object.values(inputValues)[0] || "";
      const imagePrompt = `Image of ${promptText}`;
      
      console.log('Regenerating image with prompt:', imagePrompt);
      
      // Generate a new image using DALL-E
      const imgUrl = await generateImage(
        imagePrompt,
        'dall-e-3'
      );
      
      // Update the image URL
      setImageUrl(imgUrl);
      
      // Deduct credits for regeneration
      deductCredits(regenerationCost, "Regenerate image", prompt.id);
      
      toast.success(`Image regenerated! -${regenerationCost} credits`);
    } catch (err) {
      console.error('Error regenerating image:', err);
      toast.error('Failed to regenerate image');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderInputField = (field: InputField) => {
    // Handle different field types
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
        // Default to text input
        // Use textarea for code fields
        if (field.label.toLowerCase().includes('code') || 
            field.placeholder.toLowerCase().includes('code')) {
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
        }
        
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-md shadow-md flex flex-col items-center">
            <LoadingIndicator size="lg" />
            <span className="mt-3 text-sm font-medium text-gray-700">
              {(() => {
                if (hasTextCapability && hasImageCapability) {
                  return 'Generating text and image...';
                } else if (hasTextCapability) {
                  return 'Generating text...';
                } else if (hasImageCapability) {
                  return 'Generating image...';
                } else {
                  return 'Processing...';
                }
              })()}
            </span>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{prompt.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
        
        {hasImageCapability && (
          <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Image Generation
          </div>
        )}
        
        {hasTextCapability && (
          <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
            Text Generation
          </div>
        )}
      </div>
      
      <div className="p-4">
        {!showOutput ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {prompt.inputFields.map((field) => (
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
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            {showCreditWarning && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Not enough credits! You need {prompt.creditCost} credits but have {credits} credits.
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <div>
                <span className={`text-sm ${credits < prompt.creditCost ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                  Cost: <span className="font-semibold">{prompt.creditCost} credits</span>
                  {credits < prompt.creditCost ? ` (You have: ${credits})` : ''}
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
                
                <Button
                  type="submit"
                  disabled={isLoading || credits < prompt.creditCost}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <LoadingIndicator size="sm" className="mr-2" />
                      Generating...
                    </span>
                  ) : (
                    'Run Prompt'
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Only show text output if this prompt has text capabilities */}
            {hasTextCapability && output && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Text Output
                </h3>
                
                <div className="bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap shadow-inner min-h-[200px] max-h-[400px] overflow-y-auto">
                  {output}
                </div>
              </div>
            )}
            
            {/* Show image output if available */}
            {hasImageCapability && imageUrl && (
              <ImageDisplay
                imageUrl={imageUrl}
                alt={`Generated image for ${prompt.title}`}
                prompt=""
                isLoading={isLoading}
                onRegenerate={handleRegenerateImage}
                promptId={prompt.id}
                promptTitle={prompt.title}
                showPrompt={false}
              />
            )}
            
            <div className="flex items-center justify-between pt-2 space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowOutput(false)}
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={onReturn}
              >
                Back
              </Button>
              
              {hasTextCapability && output && (
                <Button
                  onClick={handleDownload}
                >
                  Download Output
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptForm;