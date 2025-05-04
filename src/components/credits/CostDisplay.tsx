'use client';

import React from 'react';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

interface CostBreakdown {
  inferenceCost: number;
  platformMarkup: number;
  creatorFee: number;
  totalCost: number;
}

interface CostDisplayProps {
  breakdown: CostBreakdown;
  showBreakdown?: boolean;
  compact?: boolean;
  loading?: boolean;
}

export default function CostDisplay({
  breakdown,
  showBreakdown = false,
  compact = false,
  loading = false,
}: CostDisplayProps) {
  if (loading) {
    return (
      <div className={`${compact ? 'text-sm' : ''}`}>
        <div className="animate-pulse bg-gray-200 h-5 w-24 rounded"></div>
      </div>
    );
  }

  // Just show the total if not displaying breakdown or in compact mode
  if (!showBreakdown || compact) {
    return (
      <div className={`font-medium ${compact ? 'text-sm' : ''}`}>
        <span>{breakdown.totalCost.toLocaleString()} credits</span>
        {!compact && (
          <span className="text-xs text-gray-500 ml-1">
            ({formatCreditsToDollars(breakdown.totalCost)})
          </span>
        )}
      </div>
    );
  }

  // Show detailed breakdown
  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      <div className="font-bold text-lg mb-2">
        {breakdown.totalCost.toLocaleString()} credits
        <span className="text-sm font-normal text-gray-500 ml-1">
          ({formatCreditsToDollars(breakdown.totalCost)})
        </span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Base inference cost:</span>
          <span>{breakdown.inferenceCost.toLocaleString()} credits</span>
        </div>
        
        {breakdown.platformMarkup > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Platform markup:</span>
            <span>{breakdown.platformMarkup.toLocaleString()} credits</span>
          </div>
        )}
        
        {breakdown.creatorFee > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Creator fee:</span>
            <span>{breakdown.creatorFee.toLocaleString()} credits</span>
          </div>
        )}
        
        <div className="border-t pt-1 mt-1 font-medium flex justify-between">
          <span>Total:</span>
          <span>{breakdown.totalCost.toLocaleString()} credits</span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        {breakdown.creatorFee > 0 ? (
          <p>Creator receives {Math.floor(breakdown.creatorFee * 0.8).toLocaleString()} credits (80% of creator fee).</p>
        ) : (
          <p>Platform markup is applied since no creator fee is set.</p>
        )}
      </div>
    </div>
  );
}
