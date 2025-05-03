'use client';

import React, { useState, useEffect } from 'react';
import { getCostBreakdown } from '@/lib/models/modelRegistry';
import ModelInfoBadge from './ModelInfoBadge';

interface PriceCalculatorProps {
  modelId: string;
  creatorFee: number;
  onChange?: (creatorFee: number) => void;
  compact?: boolean;
}

const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  modelId,
  creatorFee,
  onChange,
  compact = false,
}) => {
  const [localCreatorFee, setLocalCreatorFee] = useState<number>(creatorFee);
  const costBreakdown = getCostBreakdown(modelId, localCreatorFee);
  
  useEffect(() => {
    setLocalCreatorFee(creatorFee);
  }, [creatorFee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFee = parseInt(e.target.value) || 0;
    setLocalCreatorFee(newFee);
    
    if (onChange) {
      onChange(newFee);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <ModelInfoBadge modelId={modelId} creatorFee={localCreatorFee} />
        {onChange && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Creator fee:</span>
            <input
              type="number"
              min="0"
              max="1000"
              value={localCreatorFee}
              onChange={handleChange}
              className="w-16 text-xs px-2 py-1 border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Model</span>
          <ModelInfoBadge modelId={modelId} creatorFee={localCreatorFee} />
        </div>
        
        {onChange && (
          <div className="flex items-center space-x-2">
            <label htmlFor="creatorFee" className="text-sm text-gray-700">
              Creator fee:
            </label>
            <input
              id="creatorFee"
              type="number"
              min="0"
              max="1000"
              value={localCreatorFee}
              onChange={handleChange}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-xs text-gray-500">credits</span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Cost Breakdown</h4>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">System cost:</span>
            <span className="font-medium">{costBreakdown.baseCost} credits</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Creator fee:</span>
            <span className="font-medium">{costBreakdown.creatorFee} credits</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Platform fee:</span>
            <span className="font-medium">{costBreakdown.platformFee} credits</span>
          </div>
          
          <div className="border-t border-gray-200 my-1 pt-1"></div>
          
          <div className="flex justify-between font-medium">
            <span className="text-gray-800">Total cost:</span>
            <span className="text-gray-800">{costBreakdown.totalCost} credits</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Dollar equivalent:</span>
            <span>${costBreakdown.dollarCost}</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <div>
            With $10 of credits, users can run this prompt approximately{' '}
            <span className="font-medium">{costBreakdown.runsFor10Dollars}</span> times.
          </div>
          {creatorFee > 0 && (
            <div className="mt-1">
              You earn <span className="font-medium">{creatorFee}</span> credits per run
              (<span className="font-medium">${(creatorFee / 1000).toFixed(2)}</span>).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
