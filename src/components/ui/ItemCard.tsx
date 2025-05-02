import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, PromptFlow, ItemType } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { useUnlockedPromptStore } from '@/store/useUnlockedPromptStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import { useCreditStore } from '@/store/useCreditStore';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';
import ExampleModal from '@/components/ui/ExampleModal';
import { toast } from 'react-hot-toast';
import { getBaselineCost } from '@/lib/creditHelpers';
import { LuLock, LuKey, LuStar, LuTrash2, LuEye, LuSettings, LuNetwork, LuMessageSquare } from 'react-icons/lu';

interface ItemCardProps {
  item: Prompt | PromptFlow;
  itemType: ItemType;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  itemType,
  className = '',
}) => {
  const router = useRouter();
  const { removePrompt } = usePromptStore();
  const { removeFlow } = useFlowStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoriteStore();
  const { hasUnlockedPrompt, unlockPrompt } = useUnlockedPromptStore();
  const { hasUnlockedFlow, unlockFlow } = useUnlockedFlowStore();
  const { credits, deductCredits } = useCreditStore();
  
  const [showExample, setShowExample] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite(item.id));
  const [isMounted, setIsMounted] = useState(false);
  
  // Determine if the item is a prompt or flow
  const isPrompt = itemType === 'prompt';
  const isFlow = itemType === 'flow';
  
  // Calculate costs and check if unlocked
  const unlockPrice = isFlow ? (item as PromptFlow).unlockPrice : 0;
  const isUnlocked = isPrompt 
    ? hasUnlockedPrompt(item.id) 
    : isFlow && hasUnlockedFlow ? hasUnlockedFlow(item.id) : false;
  const isLocked = unlockPrice !== undefined && unlockPrice > 0 && !isUnlocked;
  
  // Get credit cost
  const creditCost = isPrompt 
    ? (item as Prompt).creditCost 
    : (item as PromptFlow).totalCreditCost;
  
  // Only enable client-side features after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const handleRunClick = () => {
    if (isPrompt) {
      const prompt = item as Prompt;
      if (prompt.capabilities?.includes('transformation')) {
        router.push(`/transform/${prompt.id}`);
      } else {
        router.push(`/run/${prompt.id}`);
      }
    } else {
      router.push(`/flow/${item.id}/run`);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const itemTypeLabel = isPrompt ? 'prompt' : 'flow';
    
    if (window.confirm(`Are you sure you want to remove this ${itemTypeLabel}?`)) {
      if (isPrompt && typeof removePrompt === 'function') {
        removePrompt(item.id);
        toast.success('Prompt removed');
      } else if (isFlow && typeof removeFlow === 'function') {
        removeFlow(item.id);
        toast.success('Flow removed');
      } else {
        console.error(`remove${isPrompt ? 'Prompt' : 'Flow'} function is not available`);
        toast.error(`Could not remove ${itemTypeLabel}. Please try again later.`);
      }
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (favorite) {
      removeFavorite(item.id);
      setFavorite(false);
      toast.success('Removed from favorites');
    } else {
      addFavorite(item.id);
      setFavorite(true);
      toast.success('Added to favorites');
    }
  };

  const toggleShowExample = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only show the example if we have one
    if (item.exampleOutput) {
      setShowExample(true);
    } else {
      toast.info(`No example output available for this ${isPrompt ? 'prompt' : 'flow'}`);
    }
  };

  const closeExample = () => {
    setShowExample(false);
  };
  
  const handleUnlockItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isUnlocked) {
      router.push(`/${isPrompt ? 'prompt' : 'flow'}/${item.id}/view`);
      return;
    }
    
    if (isPrompt) {
      // For prompts, we just unlock the system prompt
      unlockPrompt(item.id);
      toast.success('Prompt unlocked successfully!');
      return;
    }
    
    // For flows with a price
    if (!unlockPrice || unlockPrice <= 0) {
      // Free flow, just unlock it
      unlockFlow(item.id);
      toast.success('Flow unlocked successfully!');
      return;
    }
    
    // Check if user has enough credits
    if (credits < unlockPrice) {
      toast.error(`Not enough credits. You need ${unlockPrice} credits to unlock this flow.`);
      return;
    }
    
    // Confirm and process the unlock
    if (window.confirm(`Unlock this flow for ${unlockPrice} credits?`)) {
      deductCredits(unlockPrice);
      unlockFlow(item.id);
      toast.success(`Flow unlocked for ${unlockPrice} credits!`);
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrompt) {
      router.push(`/prompt/${item.id}/edit`);
    } else {
      router.push(`/flow/${item.id}/edit`);
    }
  };
  
  // Get capabilities (for prompts)
  const capabilities = isPrompt ? (item as Prompt).capabilities : undefined;
  
  // Draft status (for flows)
  const isDraft = isFlow ? (item as PromptFlow).isDraft : false;
  
  return (
    <div 
      className={`
        bg-white rounded-lg overflow-hidden
        border border-gray-200 transition
        transform hover:-translate-y-1 duration-200
        flex flex-col h-full
        ${isDraft ? 'border-yellow-300 shadow-[0_2px_8px_rgba(234,179,8,0.25)] hover:shadow-[0_4px_12px_rgba(234,179,8,0.35)]' : 
          isLocked ? 'border-orange-200 shadow-[0_2px_8px_rgba(249,115,22,0.25)] hover:shadow-[0_4px_12px_rgba(249,115,22,0.35)]' : 
          isPrompt ? 'shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]' : 
          'shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]'
        }
        ${className}
      `}
    >
      
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-10 flex items-center justify-center pointer-events-none z-0">
          <div className="bg-white bg-opacity-80 rounded-full p-3 shadow-lg">
            <LuLock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      )}
      {/* Draft badge */}
      {isDraft && (
        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 flex items-center justify-center">
          DRAFT
        </div>
      )}
      
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {item.title}
            {item.isPrivate && (
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
              aria-label={`Remove ${isPrompt ? 'prompt' : 'flow'}`}
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
            {isFlow && (
              <button
                onClick={handleEditClick}
                className="text-sm text-blue-500 hover:text-blue-700"
                aria-label="Edit flow"
              >
                <LuSettings className="h-4 w-4" />
              </button>
            )}
            <div className="relative whitespace-nowrap">
              <CreditBadge cost={creditCost} size="sm" />
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 overflow-hidden" title={item.description}>
          {item.description}
        </p>
        
        <div className="mt-auto">
          {/* Item-specific badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {isPrompt && (
              <>
                {capabilities?.includes('text') && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Text Generation
                  </span>
                )}
                {capabilities?.includes('image') && (
                  <span className="text-xs px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                    Image Generation
                  </span>
                )}
                {capabilities?.includes('code') && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                    Code Generation
                  </span>
                )}
                {capabilities?.includes('transformation') && (
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    Image Transformation
                  </span>
                )}
                <div className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 overflow-hidden text-ellipsis" style={{maxWidth: '130px'}} title={(item as Prompt).model}>
                  {(item as Prompt).model}
                </div>
              </>
            )}
            
            {isFlow && (
              <>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  Flow
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                  {(item as PromptFlow).steps.length} Steps
                </span>
                {/* If there's unlock price, show it */}
                {unlockPrice > 0 && !isUnlocked && (
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                    {unlockPrice} credits to unlock
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleUnlockItem}
              className={`text-xs px-2 py-1 rounded-full flex items-center ${
                isUnlocked 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              title={isUnlocked ? `View ${isPrompt ? 'system prompt' : 'flow details'}` : `Unlock ${isPrompt ? 'system prompt' : 'flow'}`}
            >
              {isUnlocked ? <LuKey size={12} /> : <LuLock size={12} />}
              <span className="ml-1">{isUnlocked ? 'Unlocked' : 'Unlock'}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleShowExample}
                className={`text-xs ${item.exampleOutput ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400 hover:text-gray-500'} flex items-center`}
                title={item.exampleOutput ? "View example output" : "No example output available"}
                disabled={!item.exampleOutput}
              >
                <LuEye size={14} />
                <span className="ml-1">Example</span>
              </button>
              
              <Button 
                variant="primary"
                size="sm"
                onClick={handleRunClick}
                disabled={isLocked}
                className={`${isPrompt ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
              >
                {isPrompt 
                  ? (capabilities?.includes('transformation') ? 'Transform' : 'Run Prompt')
                  : 'Run Flow'
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Example Modal - outside the card flow */}
      {isMounted && (
        <ExampleModal
          isOpen={showExample}
          title={item.title}
          content={item.exampleOutput || null}
          onClose={closeExample}
        />
      )}
    </div>
  );
};

export default ItemCard;