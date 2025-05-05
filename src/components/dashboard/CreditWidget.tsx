"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
import { getUserTotalCredits, getUserCreditBreakdown } from '@/lib/credits';

interface CreditWidgetProps {
  userId: string;
}

export default function CreditWidget({ userId }: CreditWidgetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [breakdown, setBreakdown] = useState<{
    purchased: number;
    bonus: number;
    referral: number;
  }>({
    purchased: 0,
    bonus: 0,
    referral: 0
  });
  
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        // Get total credits
        const totalCredits = await getUserTotalCredits(userId);
        setCredits(totalCredits);
        
        // Get breakdown
        const creditBreakdown = await getUserCreditBreakdown(userId);
        setBreakdown(creditBreakdown);
      } catch (error) {
        console.error('Error fetching credit data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchCredits();
    }
  }, [userId]);
  
  const handleClick = () => {
    router.push('/dashboard/credits');
  };
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 cursor-pointer hover:border-blue-300 hover:shadow transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-700 flex items-center">
          <CreditCard className="h-4 w-4 mr-1.5 text-blue-600" />
          Credits
        </h3>
        {loading ? (
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <TrendingUp className="h-4 w-4 text-green-500" />
        )}
      </div>
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {formatNumber(credits || 0)}
          </div>
          <div className="text-xs text-gray-500">
            = ${((credits || 0) * 0.000001).toFixed(6)} USD
          </div>
          
          {/* Credit breakdown */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Purchased</div>
                <div className="font-medium">{formatNumber(breakdown.purchased)}</div>
              </div>
              <div>
                <div className="text-gray-500">Bonus</div>
                <div className="font-medium">{formatNumber(breakdown.bonus)}</div>
              </div>
              <div>
                <div className="text-gray-500">Referral</div>
                <div className="font-medium">{formatNumber(breakdown.referral)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
