'use client';

import React, { useState } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { toast } from 'react-hot-toast';

interface WebhookTesterProps {
  promptId: string;
  webhookUrl: string;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({
  promptId,
  webhookUrl
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { getPrompt } = usePromptStore();
  
  // Get the prompt details
  const prompt = getPrompt ? getPrompt(promptId) : null;
  
  if (!prompt) {
    return null;
  }
  
  // Initial input values based on placeholders
  const initialInputs = prompt.inputFields.reduce((acc, field) => {
    acc[field.id] = field.placeholder || '';
    return acc;
  }, {} as Record<string, string>);
  
  const [inputs, setInputs] = useState(initialInputs);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For the MVP, we'll simulate a webhook call
    setIsLoading(true);
    
    // Payload for the webhook
    const payload = {
      promptId,
      inputs,
      userId: 'test-user'
    };
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For MVP, simulate a successful response
      const mockResponse = {
        result: prompt.exampleOutput || "This is a simulated response. In a production environment, this would be the actual generated output from the API.",
        ...(prompt.exampleImageUrl ? { imageUrl: prompt.exampleImageUrl } : {}),
        promptId,
        creditCost: prompt.creditCost,
        remainingCredits: 850,
        timestamp: Date.now()
      };
      
      setResult(mockResponse);
      toast.success('Webhook test successful!');
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Failed to test webhook');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center"
      >
        {isExpanded ? 'Hide Webhook Tester' : 'Show Webhook Tester'}
      </button>
      
      {isExpanded && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Test Webhook
          </h4>
          
          <form onSubmit={handleTest} className="space-y-3">
            {prompt.inputFields.map(field => (
              <div key={field.id}>
                <label 
                  htmlFor={`test-${field.id}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                
                {field.type === 'textarea' || field.label.toLowerCase().includes('code') ? (
                  <textarea
                    id={`test-${field.id}`}
                    name={field.id}
                    value={inputs[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    id={`test-${field.id}`}
                    name={field.id}
                    value={inputs[field.id]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingIndicator size="xs" className="mr-1" />
                    Testing...
                  </span>
                ) : (
                  'Test Webhook'
                )}
              </Button>
            </div>
          </form>
          
          {result && (
            <div className="mt-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">
                Test Result
              </h5>
              <pre className="text-xs font-mono text-gray-800 bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-1">
                Note: This is a simulated response for testing purposes only.
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3">
            In a production environment, this webhook would be called by external systems
            to trigger this prompt programmatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default WebhookTester;
