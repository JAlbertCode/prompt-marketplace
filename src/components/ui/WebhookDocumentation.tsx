'use client';

import React, { useState } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { LuCopy } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import { copyToClipboard } from '@/lib/shareHelpers';

interface WebhookDocumentationProps {
  promptId: string;
  webhookUrl: string;
}

const WebhookDocumentation: React.FC<WebhookDocumentationProps> = ({
  promptId,
  webhookUrl
}) => {
  const { getPrompt } = usePromptStore();
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'python'>('curl');
  
  // Get the prompt details
  const prompt = getPrompt ? getPrompt(promptId) : null;
  
  if (!prompt) {
    return null;
  }
  
  // Generate example payload
  const examplePayload = {
    promptId,
    inputs: prompt.inputFields.reduce((acc, field) => {
      acc[field.id] = field.placeholder || `Value for ${field.label}`;
      return acc;
    }, {} as Record<string, string>)
  };
  
  // Generate example code snippets
  const snippets = {
    curl: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${JSON.stringify(examplePayload, null, 2)}'`,
    
    nodejs: `const fetch = require('node-fetch');

const run = async () => {
  const response = await fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify(${JSON.stringify(examplePayload, null, 2)})
  });
  
  const result = await response.json();
  console.log(result);
};

run().catch(console.error);`,
    
    python: `import requests
import json

url = "${webhookUrl}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = json.dumps(${JSON.stringify(examplePayload, null, 2)})

response = requests.post(url, headers=headers, data=payload)
result = response.json()
print(result)`
  };
  
  const handleCopyCode = async () => {
    const snippet = snippets[activeTab];
    const success = await copyToClipboard(snippet);
    
    if (success) {
      toast.success('Code copied to clipboard');
    } else {
      toast.error('Failed to copy code');
    }
  };
  
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        API Documentation
      </h4>
      
      <div className="mb-2">
        <p className="text-xs text-gray-600 mb-1">
          Use this webhook to run the prompt programmatically. 
          The API returns both the generated content and credit information.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === 'curl' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('curl')}
          >
            cURL
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === 'nodejs' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('nodejs')}
          >
            Node.js
          </button>
          <button
            className={`px-3 py-2 text-xs font-medium ${
              activeTab === 'python' 
                ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('python')}
          >
            Python
          </button>
          
          <div className="ml-auto">
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              title="Copy code"
            >
              <LuCopy className="mr-1" size={12} />
              Copy
            </button>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50">
          <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
            {snippets[activeTab]}
          </pre>
        </div>
      </div>
      
      <div className="mt-4">
        <h5 className="text-xs font-medium text-gray-700 mb-1">
          Response Format
        </h5>
        <pre className="text-xs font-mono text-gray-800 bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
{`{
  "result": "The generated text content",
  "imageUrl": "https://url-to-generated-image.jpg", // if applicable
  "promptId": "${promptId}",
  "creditCost": ${prompt.creditCost},
  "remainingCredits": 850,
  "timestamp": 1618845461235
}`}
        </pre>
      </div>
    </div>
  );
};

export default WebhookDocumentation;
