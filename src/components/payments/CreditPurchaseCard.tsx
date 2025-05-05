/**
 * Credit Purchase Card component
 * 
 * Displays a credit bundle with purchase button that redirects to Stripe checkout
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getCreditBundles } from '@/lib/credits';
import { getStripe } from '@/lib/payments/stripe';

interface CreditPurchaseCardProps {
  bundleId: string;
  name: string;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  pricePerMillion: number;
  featured?: boolean;
  requiresMonthlyBurn?: number;
  isEligible?: boolean;
}

export default function CreditPurchaseCard({
  bundleId,
  name,
  price,
  baseCredits,
  bonusCredits,
  totalCredits,
  pricePerMillion,
  featured = false,
  requiresMonthlyBurn,
  isEligible = true,
}: CreditPurchaseCardProps) {
  const router = useRouter();
  
  // Handle purchase click
  const handlePurchase = async () => {
    try {
      // Start loading state
      toast.loading('Creating checkout session...');
      
      // Call API to create Stripe checkout session
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      
      // Clear loading toast
      toast.dismiss();
      
      // Redirect to checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        toast.error(error.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to initiate checkout');
      console.error('Error initiating checkout:', error);
    }
  };
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className={`
      border rounded-lg p-6 shadow-sm transition-all 
      ${featured ? 'bg-gradient-to-b from-blue-50 to-white border-blue-200 shadow-md scale-105' : 'bg-white'}
      ${!isEligible ? 'opacity-60' : 'hover:shadow-md'}
    `}>
      <h3 className="text-xl font-bold mb-2 text-gray-800">{name}</h3>
      
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">${price}</p>
        <p className="text-sm text-gray-500">
          ${pricePerMillion.toFixed(2)} per 1M credits
        </p>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Credits:</span>
          <span className="font-semibold">{formatNumber(baseCredits)}</span>
        </div>
        
        {bonusCredits > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">Bonus Credits:</span>
            <span className="font-semibold text-green-600">+{formatNumber(bonusCredits)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Total Credits:</span>
          <span>{formatNumber(totalCredits)}</span>
        </div>
      </div>
      
      {requiresMonthlyBurn && (
        <div className="bg-gray-50 p-3 mb-4 rounded-md text-xs text-gray-600">
          <p>
            <span className="font-medium">Eligibility: </span>
            Requires {formatNumber(requiresMonthlyBurn)} monthly credit burn
          </p>
        </div>
      )}
      
      <button
        onClick={handlePurchase}
        disabled={!isEligible}
        className={`
          w-full py-2 rounded-md font-medium transition-colors
          ${isEligible
            ? featured
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-white hover:bg-gray-900'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isEligible ? 'Purchase Now' : 'Not Eligible'}
      </button>
      
      {!isEligible && requiresMonthlyBurn && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          You need to use {formatNumber(requiresMonthlyBurn)} credits per month to qualify
        </p>
      )}
    </div>
  );
}
