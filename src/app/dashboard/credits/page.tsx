"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  CreditCardIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { getUserCredits } from '@/utils/creditManager';
import { toast } from 'react-hot-toast';

// Credit package options based on actual pricing
const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Basic', amount: 1000000, price: 1.00 },   // 1,000,000 credits = $1.00
  { id: 'standard', name: 'Standard', amount: 5000000, price: 5.00 },   // 5,000,000 credits = $5.00
  { id: 'premium', name: 'Premium', amount: 20000000, price: 20.00 },   // 20,000,000 credits = $20.00
  { id: 'pro', name: 'Professional', amount: 100000000, price: 100.00 },   // 100,000,000 credits = $100.00
];

export default function CreditsPurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to standard
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Fetch user's current credit balance
  useEffect(() => {
    const fetchCredits = async () => {
      if (session?.user?.id) {
        try {
          const userCredits = await getUserCredits(session.user.id);
          setCredits(userCredits);
        } catch (err) {
          console.error('Error fetching credit balance:', err);
        }
      }
    };
    
    fetchCredits();
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/credits');
    }
  }, [status, router]);
  
  // Handle package selection
  const handleSelectPackage = (pkg: typeof CREDIT_PACKAGES[0]) => {
    setSelectedPackage(pkg);
  };

  // Process credit purchase
  const handlePurchase = async () => {
    if (!session) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call the API to process the purchase
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase credits');
      }
      
      // Update local credit count
      setCredits(prev => (prev || 0) + selectedPackage.amount);
      setSuccess(true);
      toast.success('Credits purchased successfully!');
      
      // Refresh the session to update the credit count in the UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.message || 'Failed to purchase credits');
      toast.error('Credit purchase failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Purchase Credits</h1>
        <div className="flex items-center space-x-3">
          <Link 
            href="/dashboard/credits/transactions" 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChartBarIcon className="h-5 w-5 mr-1" />
            <span>View Transactions</span>
          </Link>
        </div>
      </div>
      
      {/* Credit balance */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Available Credits</p>
            <p className="text-2xl font-bold mt-1">
              {credits?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500">
              ${((credits || 0) / 1000000).toFixed(6)} USD
            </p>
          </div>
          <div className="rounded-full bg-blue-50 p-3">
            <CreditCardIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-medium">
            Your purchase was successful! Credits have been added to your account.
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select a credit package</h2>
          <p className="text-gray-600 mb-6">
            Credits are used to run prompts and unlock premium flows. 1 credit = $0.000001
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {CREDIT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage.id === pkg.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
                onClick={() => handleSelectPackage(pkg)}
              >
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <p className="text-2xl font-bold mt-2">${pkg.price.toFixed(2)}</p>
                <p className="text-gray-600 mt-1">{pkg.amount.toLocaleString()} credits</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <h3 className="font-semibold mb-2">Selected Package</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedPackage.name} Package</p>
                <p className="text-gray-600">{selectedPackage.amount.toLocaleString()} credits</p>
              </div>
              <p className="text-xl font-bold">${selectedPackage.price.toFixed(2)}</p>
            </div>
          </div>
          
          <button
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            onClick={handlePurchase}
            disabled={isLoading || !session || success}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : success ? (
              "Purchase Complete"
            ) : (
              <>
                <CreditCardIcon className="h-5 w-5 mr-2" />
                {session ? 'Purchase Credits' : 'Sign in to Purchase'}
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
          
          {!session && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              You need to be logged in to purchase credits.
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About Credits</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">What are credits?</h3>
            <p className="text-gray-600">
              Credits are the currency used in PromptFlow. They are used to run prompts,
              execute flows, and unlock premium content created by other users.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">How are credits used?</h3>
            <p className="text-gray-600">
              Each time you run a prompt, credits are used based on the model,
              with a small creator fee (if set) and platform fee. Running flows uses
              credits for each step. Unlocking premium flows is a one-time credit payment.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">How many credits do I need?</h3>
            <p className="text-gray-600">
              Most text prompt runs cost between 3,000-50,000 credits ($0.003-$0.05).
              Image generation typically costs 40,000-60,000 credits ($0.04-$0.06) per image.
              Flow unlocks vary based on creator pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
