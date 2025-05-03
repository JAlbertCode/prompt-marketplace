"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CreditCardIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface CreditBalanceProps {
  showBuyButton?: boolean;
  className?: string;
  refreshTrigger?: number; // Trigger refresh when this value changes
}

export default function CreditBalance({ 
  showBuyButton = true, 
  className = '', 
  refreshTrigger = 0 
}: CreditBalanceProps) {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredits() {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Fetch user's credit balance
          const response = await fetch('/api/credits/balance');
          if (!response.ok) {
            throw new Error('Failed to fetch credit balance');
          }
          
          const data = await response.json();
          setCredits(data.credits);
        } catch (err) {
          console.error('Error fetching credits:', err);
          setError('Failed to load credit balance');
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchCredits();
  }, [session, status, refreshTrigger]);

  // Not authenticated, show login prompt
  if (status === 'unauthenticated') {
    return (
      <div className={`flex items-center ${className}`}>
        <Link href="/login" className="text-blue-600 text-sm hover:underline">
          Log in to view credits
        </Link>
      </div>
    );
  }

  // Still loading session
  if (status === 'loading' || isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse h-5 w-20 bg-gray-200 rounded"></div>
        {showBuyButton && (
          <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full"></div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center text-red-500 text-sm ${className}`}>
        <span>{error}</span>
      </div>
    );
  }

  // Format the credits nicely
  const formattedCredits = credits?.toLocaleString() || '0';
  
  // Approximate dollar value
  const dollarValue = credits ? (credits / 1000000).toFixed(6) : '0.000000';

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-1 text-sm">
        <CreditCardIcon className="h-4 w-4 text-gray-500 mr-2" />
        <div className="flex flex-col">
          <span className="font-medium">{formattedCredits} credits</span>
          <span className="text-gray-500 text-xs">${dollarValue}</span>
        </div>
      </div>
      
      {showBuyButton && (
        <Link 
          href="/dashboard/credits" 
          className="ml-2 p-1 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
          title="Buy Credits"
        >
          <PlusCircleIcon className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}

// Credit Cost Display Component
interface CreditCostDisplayProps {
  systemCost: number;
  creatorFee: number;
  platformFee: number;
  totalCost: number;
  showBreakdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CreditCostDisplay({
  systemCost,
  creatorFee,
  platformFee,
  totalCost,
  showBreakdown = false,
  size = 'md',
}: CreditCostDisplayProps) {
  const formatValue = (value: number) => value.toLocaleString();
  
  // Convert to dollars
  const dollarCost = (totalCost / 1000000).toFixed(6);
  
  // Determine text sizes based on the size prop
  const textSizes = {
    sm: {
      main: 'text-sm',
      sub: 'text-xs',
      breakdown: 'text-xs',
    },
    md: {
      main: 'text-base',
      sub: 'text-xs',
      breakdown: 'text-sm',
    },
    lg: {
      main: 'text-lg',
      sub: 'text-sm',
      breakdown: 'text-sm',
    },
  }[size];

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span className={`font-medium ${textSizes.main}`}>
          {formatValue(totalCost)} credits
        </span>
        <span className={`ml-1 text-gray-500 ${textSizes.sub}`}>
          (${dollarCost})
        </span>
      </div>
      
      {showBreakdown && (
        <div className={`mt-1 text-gray-500 space-y-0.5 ${textSizes.breakdown}`}>
          <div className="flex justify-between">
            <span>Inference cost:</span>
            <span>{formatValue(systemCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform fee:</span>
            <span>{formatValue(platformFee)}</span>
          </div>
          {creatorFee > 0 && (
            <div className="flex justify-between">
              <span>Creator fee:</span>
              <span>{formatValue(creatorFee)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
