/**
 * Payment Success Page
 * 
 * This page is shown after a successful credit purchase via Stripe
 * It processes the payment and adds credits to the user's account
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  userId: string;
  bundle: {
    id: string;
    name: string;
    baseCredits: number;
    bonusCredits: number;
    totalCredits: number;
  };
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams?.get('session_id');
        
        if (!sessionId) {
          setError('Missing session ID');
          setLoading(false);
          return;
        }
        
        // Process the payment through our API
        const response = await fetch(`/api/payments/stripe/success?session_id=${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process payment');
        }
        
        const data = await response.json();
        setResult(data);
        
        // Show success message
        toast.success('Payment successful! Credits added to your account.');
      } catch (err) {
        console.error('Error processing payment:', err);
        setError((err as Error).message || 'Failed to process payment');
        toast.error('There was an error processing your payment.');
      } finally {
        setLoading(false);
      }
    };
    
    processPayment();
  }, [searchParams, router]);
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        {loading ? (
          <div className="py-8">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        ) : error ? (
          <div className="py-8">
            <svg
              className="h-16 w-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/dashboard/credits"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors"
            >
              Back to Credits
            </Link>
          </div>
        ) : result ? (
          <div className="py-4">
            <div className="mb-6">
              <svg
                className="h-16 w-16 text-green-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">
                Your credits have been added to your account.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Purchase Summary</h3>
              
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{result.bundle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Credits:</span>
                  <span className="font-medium">{formatNumber(result.bundle.baseCredits)}</span>
                </div>
                {result.bundle.bonusCredits > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Bonus Credits:</span>
                    <span className="font-medium text-green-600">
                      +{formatNumber(result.bundle.bonusCredits)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Credits Added:</span>
                  <span>{formatNumber(result.bundle.totalCredits)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/dashboard/credits"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors"
              >
                View Credit Balance
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-2 rounded-md transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
