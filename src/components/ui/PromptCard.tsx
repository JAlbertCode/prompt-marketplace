import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';
import { toast } from 'react-hot-toast';

interface PromptCardProps {
  prompt: Prompt;
  className?: string;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  className = '',
}) => {
  const router = useRouter();
  const { removePrompt } = usePromptStore();
  
  const [showExample, setShowExample] = useState(false);
  
  const handleRunClick = () => {
    router.push(`/run/${prompt.id}`);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this prompt?')) {
      // Check if removePrompt function exists before calling it
      if (typeof removePrompt === 'function') {
        removePrompt(prompt.id);
        toast.success('Prompt removed');
      } else {
        console.error('removePrompt function is not available');
        toast.error('Could not remove prompt. Please try again later.');
      }
    }
  };

  const toggleShowExample = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowExample(!showExample);
  };
  
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        border border-gray-200 hover:shadow-lg transition
        transform hover:-translate-y-1 duration-200
        flex flex-col h-full
        ${className}
      `}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {prompt.title}
          </h3>
          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            <button
              onClick={handleRemoveClick}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label="Remove prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <div className="whitespace-nowrap">
              <CreditBadge cost={prompt.creditCost} size="sm" />
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 overflow-hidden">
          {prompt.description}
        </p>
        
        <div className="flex-grow">
          {prompt.exampleOutput && (
            <div className="mb-4">
              <button 
                onClick={toggleShowExample}
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                {showExample ? 'Hide Example Output' : 'Show Example Output'}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`ml-1 transition-transform ${showExample ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showExample && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{prompt.exampleOutput}</pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[120px]">
            {prompt.model}
          </div>
          
          <Button 
            variant="primary"
            size="sm"
            onClick={handleRunClick}
          >
            Run Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
