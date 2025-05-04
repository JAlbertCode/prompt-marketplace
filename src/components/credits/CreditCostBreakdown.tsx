import React from 'react';
import { getCostBreakdown, PromptLength } from '@/lib/models/modelRegistry';

interface CreditCostBreakdownProps {
  modelId: string;
  promptLength?: PromptLength;
  creatorFeePercentage?: number;
  showDollarAmount?: boolean;
  compact?: boolean;
}

const CreditCostBreakdown: React.FC<CreditCostBreakdownProps> = ({
  modelId,
  promptLength = 'medium',
  creatorFeePercentage = 0,
  showDollarAmount = false,
  compact = false
}) => {
  // Get cost breakdown for the model
  const breakdown = getCostBreakdown(modelId, promptLength, creatorFeePercentage);
  
  // Format credit amount
  const formatCredits = (amount: number): string => {
    return amount.toLocaleString();
  };
  
  if (compact) {
    return (
      <div className="text-sm flex items-center">
        <span className="text-blue-600 mr-1">💎</span>
        <span>
          {formatCredits(breakdown.totalCost)} credits
          {showDollarAmount && ` (${breakdown.dollarCost})`}
        </span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      <h4 className="text-sm font-medium mb-2">Cost Breakdown</h4>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base model cost:</span>
          <span>
            {formatCredits(breakdown.baseCost)} credits
            {showDollarAmount && ` ($${(breakdown.baseCost * 0.000001).toFixed(6)})`}
          </span>
        </div>
        
        {breakdown.platformFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform fee:</span>
            <span>
              {formatCredits(breakdown.platformFee)} credits
              {showDollarAmount && ` ($${(breakdown.platformFee * 0.000001).toFixed(6)})`}
            </span>
          </div>
        )}
        
        {breakdown.creatorFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Creator fee ({creatorFeePercentage}%):</span>
            <span>
              {formatCredits(breakdown.creatorFee)} credits
              {showDollarAmount && ` ($${(breakdown.creatorFee * 0.000001).toFixed(6)})`}
            </span>
          </div>
        )}
        
        <div className="flex justify-between font-medium pt-1 border-t border-gray-200 mt-1">
          <span>Total:</span>
          <span>
            {formatCredits(breakdown.totalCost)} credits
            {showDollarAmount && ` (${breakdown.dollarCost})`}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Credits are deducted when the model is run
      </div>
    </div>
  );
};

export default CreditCostBreakdown;