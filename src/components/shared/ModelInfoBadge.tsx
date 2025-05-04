'use client';

import React, { useState } from 'react';
import { getModelById, getCostBreakdown, PromptLength } from '@/lib/models/modelRegistry';

interface ModelInfoBadgeProps {
  modelId: string;
  creatorFee?: number;
  promptLength?: PromptLength;
  showDetails?: boolean;
}

const ModelInfoBadge: React.FC<ModelInfoBadgeProps> = ({ 
  modelId, 
  creatorFee = 0,
  promptLength = 'medium',
  showDetails = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const model = getModelById(modelId);
  
  if (!model) {
    return null;
  }

  // Get cost breakdown with the correct parameters
  const costBreakdown = getCostBreakdown(modelId, promptLength, creatorFee);
  
  return (
    <div className="inline-block">
      <div 
        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 text-xs font-medium cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="whitespace-nowrap">{model.displayName}</span>
        <span className="h-3 border-l border-blue-300"></span>
        <span className="whitespace-nowrap">{costBreakdown.totalCost.toLocaleString()} credits</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-white border border-blue-100 rounded-md shadow-sm text-xs">
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div>Provider:</div>
            <div className="font-medium text-gray-800">{model.provider}</div>
            
            <div>Base cost:</div>
            <div className="font-medium text-gray-800">{costBreakdown.baseCost.toLocaleString()} credits</div>
            
            <div>Platform fee:</div>
            <div className="font-medium text-gray-800">{costBreakdown.platformFee.toLocaleString()} credits</div>
            
            <div>Creator fee:</div>
            <div className="font-medium text-gray-800">{costBreakdown.creatorFee.toLocaleString()} credits</div>
            
            <div className="col-span-2 border-t border-gray-200 my-1"></div>
            
            <div>Total cost:</div>
            <div className="font-medium text-gray-800">{costBreakdown.totalCost.toLocaleString()} credits</div>
            
            <div>Dollar cost:</div>
            <div className="font-medium text-gray-800">{costBreakdown.dollarCost}</div>
            
            <div className="col-span-2 mt-2 text-gray-500 text-[11px]">
              With $10 credit purchase, you get approximately {Math.floor(10000000 / costBreakdown.totalCost).toLocaleString()} runs.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelInfoBadge;