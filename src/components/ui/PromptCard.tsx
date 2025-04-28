import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useUnlockedPromptStore } from '@/store/useUnlockedPromptStore';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';
import CreditCostBreakdown from '@/components/ui/CreditCostBreakdown';
import ExampleModal from '@/components/ui/ExampleModal';
import { toast } from 'react-hot-toast';
import { getBaselineCost } from '@/lib/creditHelpers';
import { LuLock, LuKey, LuStar, LuTrash2, LuEye } from 'react-icons/lu';

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
  const { hasUnlockedPrompt, unlockPrompt } = useUnlockedPromptStore();
  
  const [showExample, setShowExample] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite(prompt.id));
  const [isMounted, setIsMounted] = useState(false);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  
  const isUnlocked = hasUnlockedPrompt(prompt.id);
  const baselineCost = getBaselineCost(prompt.model);
  const creatorFee = prompt.creditCost - baselineCost;
  
  // Only enable client-side features after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
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
    e.preventDefault();
    e.stopPropagation();
    
    // Only show the example if we have one
    if (prompt.exampleOutput) {
      setShowExample(true);
    } else {
      toast.info('No example output available for this prompt');
    }
  };

  const closeExample = () => {
    setShowExample(false);
  };
  
  const handleUnlockPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUnlocked) {
      router.push(`/prompt/${prompt.id}/view`);
      return;
    }
    
    // In a real app, this would deduct credits and give access
    // For the MVP, we'll just grant access
    if (window.confirm(`Unlock the full system prompt for ${prompt.title}?`)) {
      unlockPrompt(prompt.id);
      toast.success('Prompt unlocked successfully!');
    }
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
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {prompt.title}
            {prompt.isPrivate && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Private
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            <button
              onClick={toggleFavorite}
              className={`text-sm ${favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-400`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <LuStar className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleRemoveClick}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label="Remove prompt"
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
            <div 
              className="relative whitespace-nowrap"
              onMouseEnter={() => setShowCreditDetails(true)}
              onMouseLeave={() => setShowCreditDetails(false)}
            >
              <CreditBadge cost={prompt.creditCost} size="sm" />
              
              {showCreditDetails && (
                <div className="absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded shadow-lg right-0 w-48">
                  <CreditCostBreakdown
                    model={prompt.model}
                    creatorFee={creatorFee}
                    showUSD={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">
          {prompt.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-2">
            {prompt.capabilities && prompt.capabilities.includes('text') && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Text Generation
              </span>
            )}
            {prompt.capabilities && prompt.capabilities.includes('image') && (
              <span className="text-xs px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                Image Generation
              </span>
            )}
            {prompt.capabilities && prompt.capabilities.includes('code') && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                Code Generation
              </span>
            )}
            <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 truncate max-w-[120px]">
              {prompt.model}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleUnlockPrompt}
              className={`text-xs px-2 py-1 rounded-full flex items-center ${
                isUnlocked 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              title={isUnlocked ? "View system prompt" : "Unlock system prompt"}
            >
              {isUnlocked ? <LuKey size={12} /> : <LuLock size={12} />}
              <span className="ml-1">{isUnlocked ? 'Unlocked' : 'Unlock'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleShowExample}
                className={`text-xs ${prompt.exampleOutput ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-gray-500'} flex items-center`}
                title={prompt.exampleOutput ? "View example output" : "No example output available"}
                disabled={!prompt.exampleOutput}
              >
                <LuEye size={14} />
                <span className="ml-1">Example</span>
              </button>
              
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
      </div>
      
      {/* Example Modal - outside the card flow */}
      {isMounted && (
        <ExampleModal
          isOpen={showExample}
          title={prompt.title}
          content={prompt.exampleOutput || null}
          onClose={closeExample}
        />
      )}
    </div>
  );
};

export default PromptCard;
