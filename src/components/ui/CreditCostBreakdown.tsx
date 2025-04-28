'use client';

import { useState } from 'react';
import { SonarModel } from '@/types';
import { 
  getBaselineCost, 
  calculateTotalCost, 
  formatCredits,
  creditsToUSD
} from '@/lib/creditHelpers';
import { LuInfo } from 'react-icons/lu';

interface CreditCostBreakdownProps {
  model: SonarModel;
  creatorFee?: number;
  showUSD?: boolean;
  onlyTotal?: boolean;
}

export default function CreditCostBreakdown({ 
  model, 
  creatorFee = 0, 
  showUSD = false,
  onlyTotal = false
}: CreditCostBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const baselineCost = getBaselineCost(model);
  const costBreakdown = calculateTotalCost(baselineCost, creatorFee);
  
  if (onlyTotal) {
    return (
      <div className="flex items-center">
        <span className="font-medium">{formatCredits(costBreakdown.totalCost)} credits</span>
        {showUSD && (
          <span className="text-gray-500 text-xs ml-1">
            ({creditsToUSD(costBreakdown.totalCost)})
          </span>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Show cost breakdown"
        >
          <LuInfo size={16} />
        </button>
        
        {isExpanded && (
          <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-3 w-64 top-full right-0">
            <h4 className="font-semibold text-sm mb-2">Credit Cost Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Cost ({model})</span>
                <span>{formatCredits(costBreakdown.baselineCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Creator Fee</span>
                <span>{formatCredits(costBreakdown.creatorFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>{formatCredits(costBreakdown.platformFee)}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCredits(costBreakdown.totalCost)}</span>
              </div>
              {showUSD && (
                <div className="text-xs text-gray-500 mt-2">
                  Approximately {creditsToUSD(costBreakdown.totalCost)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      <h4 className="font-semibold text-sm mb-2">Credit Cost Breakdown</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Base Cost ({model})</span>
          <span>{formatCredits(costBreakdown.baselineCost)}</span>
        </div>
        <div className="flex justify-between">
          <span>Creator Fee</span>
          <span>{formatCredits(costBreakdown.creatorFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span>{formatCredits(costBreakdown.platformFee)}</span>
        </div>
        <div className="border-t pt-1 flex justify-between font-medium">
          <span>Total</span>
          <span>{formatCredits(costBreakdown.totalCost)}</span>
        </div>
        {showUSD && (
          <div className="text-xs text-gray-500 mt-2">
            Approximately {creditsToUSD(costBreakdown.totalCost)}
          </div>
        )}
      </div>
    </div>
  );
}
