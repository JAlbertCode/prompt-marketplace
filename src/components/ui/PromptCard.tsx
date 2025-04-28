import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
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
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  
  const [showExample, setShowExample] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite(prompt.id));
  
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

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (favorite) {
      removeFavorite(prompt.id);
      setFavorite(false);
      toast.success('Removed from favorites');
    } else {
      addFavorite(prompt.id);
      setFavorite(true);
      toast.success('Added to favorites');
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
              onClick={toggleFavorite}
              className={`text-sm ${favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-400`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
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
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[120px]">
            {prompt.model}
          </div>
          
          <div className="flex items-center space-x-2">
            {prompt.exampleOutput && (
              <button 
                onClick={toggleShowExample}
                className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                title="View example output"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span className="ml-1">Example</span>
              </button>
            )}
            
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
      
      {/* Example output modal/overlay */}
      {showExample && prompt.exampleOutput && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" onClick={toggleShowExample}>
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Example Output: {prompt.title}</h3>
              <button 
                onClick={toggleShowExample}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{prompt.exampleOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptCard;
