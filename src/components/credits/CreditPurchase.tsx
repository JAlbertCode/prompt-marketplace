import React, { useState } from 'react';
import { dollarsToCredits } from '@/utils/creditManager';

// Define available credit packages
const creditPackages = [
  {
    id: 'basic',
    name: 'Basic',
    dollars: 10,
    bonusCredits: 0, // No bonus
    description: 'Perfect for trying out prompts',
  },
  {
    id: 'standard',
    name: 'Standard',
    dollars: 25,
    bonusCredits: 1_000_000, // $1 worth bonus
    description: 'Our most popular package',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    dollars: 50,
    bonusCredits: 5_000_000, // $5 worth bonus
    description: 'Best value for regular users',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    dollars: 100,
    bonusCredits: 15_000_000, // $15 worth bonus
    description: 'For professional prompt engineers',
  },
];

interface CreditPurchaseProps {
  onPurchase: (packageId: string, amount: number) => Promise<boolean>;
  currentCredits: number;
}

export default function CreditPurchase({ onPurchase, currentCredits }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setError(null);
    setSuccess(null);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Please select a credit package');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const pkg = creditPackages.find(p => p.id === selectedPackage);
      if (!pkg) {
        throw new Error('Invalid package selected');
      }
      
      const result = await onPurchase(selectedPackage, pkg.dollars);
      
      if (result) {
        setSuccess(`Successfully purchased ${pkg.name} package! Credits will be added to your account.`);
        setSelectedPackage(null);
      } else {
        setError('Failed to process payment. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during payment processing');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Purchase Credits</h2>
      <p className="text-gray-600 mb-6">Your current balance: {currentCredits.toLocaleString()} credits (${(currentCredits * 0.000001).toFixed(2)})</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {creditPackages.map((pkg) => {
          const baseCredits = dollarsToCredits(pkg.dollars);
          const totalCredits = baseCredits + pkg.bonusCredits;
          
          return (
            <div 
              key={pkg.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPackage === pkg.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : pkg.highlight 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleSelect(pkg.id)}
            >
              <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
              <p className="text-3xl font-bold mb-1">${pkg.dollars}</p>
              
              <div className="mb-2">
                <p className="text-gray-700">
                  {baseCredits.toLocaleString()} credits
                </p>
                {pkg.bonusCredits > 0 && (
                  <p className="text-green-600 font-medium">
                    +{pkg.bonusCredits.toLocaleString()} bonus credits
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {totalCredits.toLocaleString()} total credits
                </p>
              </div>
              
              <p className="text-sm text-gray-600">{pkg.description}</p>
              
              {pkg.highlight && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Best Value
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-center">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg disabled:opacity-50"
          onClick={handlePurchase}
          disabled={!selectedPackage || processing}
        >
          {processing ? 'Processing...' : 'Purchase Credits'}
        </button>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 border-t pt-4">
        <p>Credit conversion rate: $1 = 1,000,000 credits</p>
        <p>Purchased credits never expire. Bonus credits from packages cannot be refunded or transferred.</p>
        <p>For custom enterprise packages, please contact our sales team.</p>
      </div>
    </div>
  );
}
