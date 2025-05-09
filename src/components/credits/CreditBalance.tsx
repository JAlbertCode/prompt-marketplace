'use client';

import React from 'react';
import Link from 'next/link';
import { creditsToDollars } from '@/utils/creditManager';

interface CreditBalanceProps {
  credits: number;
  loading?: boolean;
  compact?: boolean;
  showBuyButton?: boolean;
}

export default function CreditBalance({
  credits,
  loading = false,
  compact = false,
  showBuyButton = true,
}: CreditBalanceProps) {
  if (loading) {
    return (
      <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
        <div className="animate-pulse bg-gray-200 h-5 w-24 rounded"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center text-sm">
        <span className="font-medium mr-1">
          {credits.toLocaleString()} credits
        </span>
        {showBuyButton && (
          <Link
            href="/credits/buy"
            className="text-blue-600 hover:text-blue-800 text-xs ml-2"
          >
            + Buy
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <div>
        <div className="font-bold text-lg">
          {credits.toLocaleString()} credits
        </div>
        <div className="text-gray-500 text-sm">
          ≈ {creditsToDollars(credits)}
        </div>
      </div>
      {showBuyButton && (
        <Link
          href="/credits/buy"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          + Buy Credits
        </Link>
      )}
    </div>
  );
}
