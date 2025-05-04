import React, { useState } from 'react';
import { getModelById, getCostBreakdown } from '@/lib/models/modelRegistry';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ModelInfoBadgeProps {
  modelId: string;
  creatorFee?: number;
  showDetails?: boolean;
  className?: string;
}

const ModelInfoBadge: React.FC<ModelInfoBadgeProps> = ({
  modelId,
  creatorFee = 0,
  showDetails = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const model = getModelById(modelId);
  
  if (!model) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        Unknown Model
      </span>
    );
  }
  
  // Get cost breakdown
  const costBreakdown = getCostBreakdown(modelId, creatorFee);
  
  // Define provider-based colors
  const providerColors = {
    openai: 'bg-green-100 text-green-800 border-green-200',
    perplexity: 'bg-purple-100 text-purple-800 border-purple-200',
    anthropic: 'bg-blue-100 text-blue-800 border-blue-200',
    stability: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    internal: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  // Get colors based on provider
  const colors = providerColors[model.provider] || providerColors.internal;
  
  return (
    <div className="inline-block">
      <div className={`
        inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium
        ${colors} ${className}
      `}>
        <span>{model.displayName}</span>
        
        {costBreakdown && (
          <span className="ml-1.5 opacity-70">
            {costBreakdown.totalCost.toLocaleString()} credits
          </span>
        )}
        
        {showDetails && (
          <div
            className="relative inline-block ml-1"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              type="button"
              className="flex items-center focus:outline-none"
            >
              <InformationCircleIcon className="h-3.5 w-3.5 opacity-70" />
            </button>
            
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                <div className="bg-white border border-gray-200 rounded-md shadow-md p-2 text-xs w-48 text-gray-800">
                  <div className="font-medium mb-1">{model.displayName}</div>
                  {model.description && (
                    <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                  )}
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Base cost:</span>
                      <span>{costBreakdown.inferenceCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee:</span>
                      <span>{costBreakdown.platformFee.toLocaleString()}</span>
                    </div>
                    {creatorFee > 0 && (
                      <div className="flex justify-between">
                        <span>Creator fee:</span>
                        <span>{costBreakdown.creatorFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-1 font-medium flex justify-between">
                      <span>Total:</span>
                      <span>{costBreakdown.totalCost.toLocaleString()} credits</span>
                    </div>
                    <div className="text-xs text-right text-gray-500">
                      ${costBreakdown.dollarCost}
                    </div>
                  </div>
                </div>
                
                <div className="w-3 h-3 bg-white transform rotate-45 border-b border-r border-gray-200 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelInfoBadge;
