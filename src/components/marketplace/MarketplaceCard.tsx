'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useCreditStore } from '@/store/useCreditStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import { ItemType } from '@/types';

interface MarketplaceItemProps {
  id: string;
  title: string;
  description: string;
  creditCost: number;
  type: ItemType;
  isLocked?: boolean;
  unlockPrice?: number;
  isDraft?: boolean;
}

interface MarketplaceCardProps {
  item: MarketplaceItemProps;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item }) => {
  const { credits, deductCredits } = useCreditStore();
  const { unlockFlow, isFlowUnlocked } = useUnlockedFlowStore();
  
  const handleUnlock = () => {
    if (!item.unlockPrice || item.unlockPrice <= 0) return;
    
    if (credits < item.unlockPrice) {
      toast.error(`Not enough credits. You need ${item.unlockPrice} credits to unlock this flow.`);
      return;
    }
    
    // Deduct credits and unlock the flow
    deductCredits(item.unlockPrice);
    unlockFlow(item.id);
    
    toast.success(`Flow unlocked for ${item.unlockPrice} credits!`);
  };
  
  // Determine if the item is a draft
  const isDraft = item.isDraft;
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${
      isDraft ? 'border-yellow-300' : item.isLocked ? 'border-gray-300' : 'border-indigo-200'
    }`}>
      {/* Draft badge */}
      {isDraft && (
        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 flex items-center justify-center">
          DRAFT
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {item.title}
          </h3>
          <div className="flex items-center">
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              item.type === 'prompt' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {item.type === 'prompt' ? 'Prompt' : 'Flow'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {item.description || `A ${item.type === 'prompt' ? 'prompt' : 'flow'} without a description.`}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            <span className="font-semibold">{item.creditCost}</span> credits
            {item.isLocked && (
              <span className="ml-2 text-orange-600">
                + <span className="font-semibold">{item.unlockPrice}</span> to unlock
              </span>
            )}
          </div>
          
          {item.isLocked ? (
            <button
              onClick={handleUnlock}
              disabled={credits < (item.unlockPrice || 0)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                credits >= (item.unlockPrice || 0)
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Unlock
            </button>
          ) : (
            <Link
              href={`/run/${item.id}?type=${item.type}`}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              {item.type === 'prompt' ? 'Run' : 'Execute Flow'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCard;
