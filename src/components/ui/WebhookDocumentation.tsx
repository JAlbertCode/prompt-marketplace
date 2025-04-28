import React from 'react';

interface WebhookDocumentationProps {
  promptId: string;
  webhookUrl: string;
}

const WebhookDocumentation: React.FC<WebhookDocumentationProps> = ({
  promptId,
  webhookUrl,
}) => {
  // Example payload based on prompt ID
  const examplePayload = {
    promptId: promptId,
    inputs: {
      query: "Example input text",
      // Additional fields would be added based on the prompt's input fields
    },
    userId: "optional_user_id" // For credit tracking
  };

  return (
    <div className="mt-3 border border-gray-200 rounded-md p-3 bg-white">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Webhook Integration Guide</h4>
      
      <div className="space-y-4">
        <div>
          <h5 className="text-xs font-medium text-gray-700">Making API Calls</h5>
          <p className="text-xs text-gray-600 mt-1">
            Use this endpoint to execute the prompt programmatically from your applications,
            automation tools, or services like N8N and Make.com.
          </p>
        </div>
        
        <div>
          <h5 className="text-xs font-medium text-gray-700">Basic Usage</h5>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
            <li>Send a POST request to <code className="bg-gray-100 px-1 py-0.5 rounded">{webhookUrl}</code></li>
            <li>Include your payload with <code className="bg-gray-100 px-1 py-0.5 rounded">promptId</code> and <code className="bg-gray-100 px-1 py-0.5 rounded">inputs</code></li>
            <li>The service will execute the prompt and return the result</li>
            <li>Credits will be deducted from your account balance</li>
          </ol>
        </div>
        
        <div>
          <h5 className="text-xs font-medium text-gray-700">Example Payload</h5>
          <pre className="mt-1 bg-gray-100 p-2 rounded-md text-xs font-mono text-gray-800 overflow-x-auto">
            {JSON.stringify(examplePayload, null, 2)}
          </pre>
        </div>
        
        <div>
          <h5 className="text-xs font-medium text-gray-700">Example Response</h5>
          <pre className="mt-1 bg-gray-100 p-2 rounded-md text-xs font-mono text-gray-800 overflow-x-auto">
            {JSON.stringify({
              result: "This is an example response from the AI.",
              promptId: promptId,
              creditCost: 25,
              remainingCredits: 975,
              timestamp: Date.now()
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
          <h5 className="text-xs font-medium text-blue-700">N8N or Make.com Integration</h5>
          <ol className="list-decimal list-inside text-xs text-blue-700 mt-1 space-y-1">
            <li>Add an HTTP Request node in your workflow</li>
            <li>Set method to POST and URL to the webhook URL</li>
            <li>Set Content-Type header to application/json</li>
            <li>Configure the payload with your dynamic values</li>
            <li>Connect the response to your next workflow steps</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WebhookDocumentation;
