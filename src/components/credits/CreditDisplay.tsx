import React, { useEffect } from 'react';
import { useCreditStore } from '@/store/useCreditStore';

interface CreditDisplayProps {
  showBreakdown?: boolean;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ showBreakdown = false }) => {
  const { credits, creditBreakdown, isLoading, error, fetchCredits } = useCreditStore();
  
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  const formatCredits = (amount: number) => {
    return amount.toLocaleString();
  };
  
  if (isLoading) {
    return <div className="animate-pulse h-6 bg-gray-200 rounded w-24"></div>;
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-sm">
        <span className="font-medium">Error:</span> Unable to load credits
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      <div className="text-lg font-medium flex items-center">
        <span className="text-blue-600 mr-1">💎</span>
        <span>{formatCredits(credits)} credits</span>
      </div>
      
      {showBreakdown && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div>Purchased:</div>
            <div className="text-right">{formatCredits(creditBreakdown.purchased)}</div>
            
            <div>Bonus:</div>
            <div className="text-right">{formatCredits(creditBreakdown.bonus)}</div>
            
            <div>Referral:</div>
            <div className="text-right">{formatCredits(creditBreakdown.referral)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;