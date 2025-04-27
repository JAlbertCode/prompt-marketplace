import React from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';

interface PromptCardProps {
  prompt: Prompt;
  className?: string;
}

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  className = '',
}) => {
  const router = useRouter();
  
  const handleRunClick = () => {
    router.push(`/run/${prompt.id}`);
  };
  
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        border border-gray-200 hover:shadow-lg transition
        ${className}
      `}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {prompt.title}
          </h3>
          <CreditBadge cost={prompt.creditCost} size="sm" />
        </div>
        
        <p className="text-gray-600 text-sm mb-4">
          {prompt.description}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="text-xs text-gray-500">
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
