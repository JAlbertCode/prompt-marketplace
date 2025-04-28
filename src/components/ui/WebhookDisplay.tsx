import React, { useState } from 'react';
import { generateWebhookUrl } from '@/lib/sonarApi';

interface WebhookDisplayProps {
  promptId: string;
  className?: string;
}

const WebhookDisplay: React.FC<WebhookDisplayProps> = ({
  promptId,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = generateWebhookUrl(promptId);
  
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
  
  return (
    <div className={`bg-gray-50 rounded-md border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">
          Webhook URL
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Coming Soon
          </span>
        </h3>
        <div className="relative">
          <button
            onClick={handleCopyClick}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="bg-gray-100 p-2 rounded-md text-sm font-mono text-gray-800 overflow-x-auto">
          {webhookUrl}
        </div>
        
        <p className="mt-2 text-xs text-gray-500">
          Use this webhook URL to trigger this prompt from external systems.
          Documentation on how to use webhooks will be available soon.
        </p>
      </div>
    </div>
  );
};

export default WebhookDisplay;