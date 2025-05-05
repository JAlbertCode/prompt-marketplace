'use client';

import React from 'react';
import { useCreditStore } from '@/store/useCreditStore';
import { formatCredits, creditsToUSD } from '@/lib/utils';
import Link from 'next/link';

interface CreditStatusSummaryProps {
  showBuyButton?: boolean;
  showDetail?: boolean;
  className?: string;
}

const CreditStatusSummary: React.FC<CreditStatusSummaryProps> = ({
  showBuyButton = true,
  showDetail = true,
  className = ''
}) => {
  const { credits, creditBreakdown, isLoading, error, fetchCredits } = useCreditStore();
  
  // Fetch credits when component mounts
  React.useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Credit Balance</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Credit Balance</h2>
        </div>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          Error loading credit information.
        </div>
      </div>
    );
  }
  
  // Calculate dollar value
  const dollarValue = credits * 0.000001; // 1 credit = $0.000001
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Credit Balance</h2>
        
        {showBuyButton && (
          <Link
            href="/credits/purchase"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Buy Credits
          </Link>
        )}
      </div>
      
      <div className="mb-3">
        <div className="text-3xl font-bold">
          {formatCredits(credits)}
        </div>
        <div className="text-sm text-gray-500">
          Approximate value: {creditsToUSD(credits)}
        </div>
      </div>
      
      {showDetail && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Credit Breakdown</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Purchased Credits:</span>
              <span className="font-medium">{formatCredits(creditBreakdown.purchased || 0)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Bonus Credits:</span>
              <span className="font-medium">{formatCredits(creditBreakdown.bonus || 0)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Referral Credits:</span>
              <span className="font-medium">{formatCredits(creditBreakdown.referral || 0)}</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Credits are used in this order: Purchased → Bonus → Referral
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditStatusSummary;