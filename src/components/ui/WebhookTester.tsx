import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface WebhookTesterProps {
  promptId: string;
  webhookUrl: string;
}

const WebhookTester: React.FC<WebhookTesterProps> = ({
  promptId,
  webhookUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({
    query: 'Test query for webhook execution'
  });
  const [response, setResponse] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleTestWebhook = async () => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          inputs,
          userId: 'current-user' // For testing purposes
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      // Format the response nicely
      const formattedResponse = JSON.stringify(data, null, 2);
      setResponse(formattedResponse);
      
      toast.success('Webhook executed successfully!');
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
      setResponse(JSON.stringify({ error: (error instanceof Error) ? error.message : 'Unknown error' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <div className="mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          Test Webhook
        </Button>
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700">Test Webhook</h4>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Input Parameters
          </label>
          <div className="space-y-2">
            {Object.keys(inputs).map(key => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="w-1/3 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  name={key}
                  value={inputs[key]}
                  onChange={handleInputChange}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Button
            type="button"
            onClick={handleTestWebhook}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingIndicator size="sm" className="mr-2" />
                Executing...
              </span>
            ) : (
              'Execute Webhook'
            )}
          </Button>
        </div>
        
        {response && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response
            </label>
            <pre className="bg-gray-100 border border-gray-300 rounded-md p-3 text-xs text-gray-800 overflow-x-auto max-h-60 overflow-y-auto">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookTester;