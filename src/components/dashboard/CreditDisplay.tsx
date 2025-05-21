'use client';

import React, { useEffect } from 'react';
import { useCreditStore } from '@/store/useCreditStore';
import { formatCredits } from '@/lib/credits/supabase';

/**
 * Client-side component for displaying credit balance
 * Uses the same credit store as the navbar for consistency
 */
const CreditDisplay = () => {
  const { credits, isLoading, error, fetchCredits } = useCreditStore();
  
  // Fetch credits when component mounts
  useEffect(() => {
    console.log('Credit display component mounted, fetching credits...');
    fetchCredits().catch(error => {
      console.error('Error fetching credits in dashboard display:', error);
    });
  }, [fetchCredits]);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="text-sm font-medium text-gray-500 mb-1">Available Credits</div>
      <div className="text-3xl font-bold mb-1">
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          credits.toLocaleString()
        )}
      </div>
      <div className="text-sm text-gray-600">
        = ${(credits * 0.000001).toFixed(6)} USD
      </div>
      {error && (
        <div className="text-sm text-red-600 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;