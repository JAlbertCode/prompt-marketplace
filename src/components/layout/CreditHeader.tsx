import React from 'react';
import { useCreditStore } from '@/store/useCreditStore';
import { toast } from 'react-hot-toast';

const CreditHeader: React.FC = () => {
  const { credits, resetCredits } = useCreditStore();
  
  const handleResetCredits = () => {
    resetCredits();
    toast.success('Credits reset to 1000!');
  };
  
  // Determine color based on credit balance
  const getCreditColor = () => {
    if (credits < 100) return 'text-red-600 bg-red-100';
    if (credits < 300) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };
  
  return (
    <div className="py-2 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center mb-4">
      <div className="flex items-center space-x-1">
        <span className="text-gray-600 text-sm">Your Balance:</span>
        <span className={`font-semibold text-sm rounded-full px-2 py-0.5 ${getCreditColor()}`}>
          💎 {credits} Credits
        </span>
        {credits < 200 && (
          <span className="text-red-600 text-xs animate-pulse">
            Low balance!
          </span>
        )}
      </div>
      
      <button
        onClick={handleResetCredits}
        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
      >
        Reset Credits
      </button>
    </div>
  );
};

export default CreditHeader;