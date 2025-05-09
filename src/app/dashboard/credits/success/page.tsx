'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useCreditStore } from '@/store/useCreditStore';

interface PaymentResult {
  success: boolean;
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
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { fetchCredits } = useCreditStore();
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams?.get('session_id');
        
        if (!sessionId) {
          setError('Missing session ID');
          setLoading(false);
          return;
        }
        
        toast.loading('Processing your payment...');
        
        // Call API to process payment
        const response = await fetch(`/api/payments/stripe/success?session_id=${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process payment');
        }
        
        const data = await response.json();
        setPaymentResult(data);
        
        // Refresh credit balance
        await fetchCredits();
        
        toast.dismiss();
        toast.success('Payment successful! Credits added to your account.');
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.dismiss();
        toast.error('There was an error processing your payment.');
        setError((error as Error).message || 'Failed to process payment');
      } finally {
        setLoading(false);
      }
    };
    
    processPayment();
  }, [searchParams, fetchCredits]);
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0';
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Processing Your Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your purchase...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/dashboard/credits"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Credits Page
            </Link>
          </div>
        ) : paymentResult ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">Your credits have been added to your account.</p>
            
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Purchase Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{paymentResult.bundle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Credits:</span>
                  <span className="font-medium">{formatNumber(paymentResult.bundle.baseCredits)}</span>
                </div>
                {paymentResult.bundle.bonusCredits > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Bonus Credits:</span>
                    <span className="font-medium text-green-600">+{formatNumber(paymentResult.bundle.bonusCredits)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Credits:</span>
                  <span>{formatNumber(paymentResult.bundle.totalCredits)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/dashboard/credits"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View Credit Balance
              </Link>
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No payment data found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
