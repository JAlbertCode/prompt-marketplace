import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Prompt, InputField } from '@/types';
import { executePrompt } from '@/lib/sonarApi';
import { formatUserInputs } from '@/lib/promptHelpers';
import { downloadTextFile, generateFilename } from '@/lib/downloadHelpers';
import { useCreditStore } from '@/store/useCreditStore';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  
  useEffect(() => {
    // Check if credits are insufficient and show warning
    setShowCreditWarning(credits < prompt.creditCost);
  }, [credits, prompt.creditCost]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      // Call the Sonar API
      const result = await executePrompt(
        prompt.systemPrompt,
        formattedInputs,
        prompt.model
      );
      
      // Deduct credits
      deductCredits(prompt.creditCost);
      
      // Set the output
      setOutput(result);
      
      // Show success notification
      toast.success(`Prompt executed! -${prompt.creditCost} credits`);
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-md shadow-md flex flex-col items-center">
            <LoadingIndicator size="lg" />
            <span className="mt-3 text-sm font-medium text-gray-700">Generating response...</span>
          </div>
        </div>
      )}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{prompt.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
      </div>
      
      <div className="p-4">
        {!output ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {prompt.inputFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label 
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}{field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.label.toLowerCase().includes('code') || 
                 field.placeholder.toLowerCase().includes('code') ? (
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
                ) : (
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
                )}
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
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Output
              </h3>
              
              <div className="bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap shadow-inner min-h-[200px] max-h-[400px] overflow-y-auto">
                {output}
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={onReturn}
              >
                Back
              </Button>
              
              <Button
                onClick={handleDownload}
              >
                Download Output
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptForm;
