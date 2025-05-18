'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCreditStore } from '@/store/useCreditStore';
import { formatCredits } from '@/lib/creditHelpers';

/**
 * Dashboard-specific credit display component
 */
const DashboardCreditCard = () => {
  const { credits, isLoading, fetchCredits } = useCreditStore();
  
  // Fetch credits when component mounts
  useEffect(() => {
    console.log('Dashboard credit card mounted, fetching credits...');
    fetchCredits().catch(error => {
      console.error('Error fetching credits in dashboard:', error);
    });
  }, [fetchCredits]);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">Available Credits</h3>
      
      <div className="text-3xl font-bold text-gray-900">
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          formatCredits(credits)
        )}
      </div>
      
      <div className="mt-1 text-sm text-gray-500">
        = ${(credits * 0.000001).toFixed(2)} USD
      </div>
      
      <Link
        href="/dashboard/credits"
        className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium"
      >
        Purchase Credits <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Link>
    </div>
  );
};

export default DashboardCreditCard;