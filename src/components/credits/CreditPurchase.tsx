import React, { useState } from 'react';
import { getCreditBundles } from '@/lib/credits';
import { useCreditStore } from '@/store/useCreditStore';

interface CreditPurchaseProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const CreditPurchase: React.FC<CreditPurchaseProps> = ({ 
  onSuccess, 
  compact = false
}) => {
  const { addCredits } = useCreditStore();
  const [selectedBundle, setSelectedBundle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const creditBundles = getCreditBundles();
  
  const handleBundleSelect = (bundleId: string) => {
    setSelectedBundle(bundleId);
    setError(null);
  };
  
  const handlePurchase = async () => {
    if (!selectedBundle) {
      setError('Please select a credit bundle');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const bundle = creditBundles.find(b => b.id === selectedBundle);
      
      if (!bundle) {
        throw new Error('Invalid bundle selected');
      }

      // Call Stripe checkout endpoint
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bundleId: selectedBundle })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      
      // For development/testing purposes, allow direct credit addition if enabled
      const isDevelopment = process.env.NODE_ENV === 'development';
      const skipStripe = process.env.NEXT_PUBLIC_SKIP_STRIPE === 'true';
      
      if (isDevelopment && skipStripe) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Add the credits to the user's account directly
        await addCredits(bundle.totalCredits, 'development_purchase');
        
        setShowSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Redirect to Stripe Checkout
        // Load Stripe dynamically to avoid issues during SSR
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripePublishableKey) {
          throw new Error('Stripe publishable key is not configured');
        }
        
        const stripe = await loadStripe(stripePublishableKey);
        
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        // Redirect to Stripe Checkout
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setError(error instanceof Error ? error.message : 'Failed to purchase credits');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (compact) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Purchase Credits</h3>
          
          <div className="flex flex-wrap gap-2">
            {creditBundles.slice(0, 3).map(bundle => (
              <button
                key={bundle.id}
                onClick={() => handleBundleSelect(bundle.id)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  selectedBundle === bundle.id
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                ${bundle.price} - {(bundle.totalCredits / 1_000_000).toFixed(1)}M
              </button>
            ))}
          </div>
          
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          
          {showSuccess && (
            <div className="text-sm text-green-600">
              Credits added successfully!
            </div>
          )}
          
          <button
            onClick={handlePurchase}
            disabled={!selectedBundle || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Purchase'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {creditBundles.map(bundle => (
            <div
              key={bundle.id}
              onClick={() => handleBundleSelect(bundle.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedBundle === bundle.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{bundle.name}</h3>
                <span className="text-xl font-bold">${bundle.price}</span>
              </div>
              
              <div className="mb-3">
                <div className="text-gray-800 font-medium">
                  {(bundle.totalCredits / 1_000_000).toFixed(1)}M credits
                </div>
                {bundle.bonusCredits > 0 && (
                  <div className="text-sm text-green-600">
                    Includes {(bundle.bonusCredits / 1_000_000).toFixed(1)}M bonus credits!
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                ${bundle.pricePerMillion.toFixed(2)} per million credits
              </div>
              
              {bundle.requiresMonthlyBurn && (
                <div className="mt-2 text-xs text-blue-600">
                  Requires {(bundle.requiresMonthlyBurn / 1_000_000).toFixed(1)}M monthly usage
                </div>
              )}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            Credits added successfully to your account!
          </div>
        )}
        
        <button
          onClick={handlePurchase}
          disabled={!selectedBundle || isLoading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Purchase ${selectedBundle ? creditBundles.find(b => b.id === selectedBundle)?.name : 'Credits'}`
          )}
        </button>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          1 credit = $0.000001 • Secure payment via Stripe • Credits never expire
        </p>
      </div>
    </div>
  );
};

export default CreditPurchase;