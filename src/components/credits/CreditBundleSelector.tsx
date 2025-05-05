'use client';

import React, { useState } from 'react';
import { getCreditBundles } from '@/lib/credits';
import { formatCredits, creditsToUSD } from '@/lib/utils';

interface CreditBundleSelectorProps {
  onSelectBundle: (bundleId: string) => void;
  isLoading?: boolean;
  userMonthlyBurn?: number;
}

const CreditBundleSelector: React.FC<CreditBundleSelectorProps> = ({
  onSelectBundle,
  isLoading = false,
  userMonthlyBurn = 0
}) => {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  
  // Get all available credit bundles
  const bundles = getCreditBundles();
  
  // Handle bundle selection
  const handleSelect = (bundleId: string) => {
    setSelectedBundle(bundleId);
    onSelectBundle(bundleId);
  };
  
  // Check if user qualifies for enterprise tier
  const qualifiesForEnterprise = userMonthlyBurn >= 1_400_000;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bundles
          // Filter out enterprise bundle if user doesn't qualify
          .filter(bundle => !bundle.requiresMonthlyBurn || qualifiesForEnterprise)
          .map(bundle => {
            const isSelected = selectedBundle === bundle.id;
            const isEnterprise = bundle.id === 'enterprise';
            
            return (
              <div
                key={bundle.id}
                onClick={() => handleSelect(bundle.id)}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'}
                  ${isEnterprise ? 'relative overflow-hidden' : ''}
                `}
              >
                {isEnterprise && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 transform translate-x-4 -translate-y-0 rotate-45">
                    BEST VALUE
                  </div>
                )}
                
                <div className="font-medium text-lg mb-1">{bundle.name}</div>
                
                <div className="text-3xl font-bold mb-3">
                  ${bundle.price}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Base credits:</span>
                    <span className="font-medium">{formatCredits(bundle.baseCredits)}</span>
                  </div>
                  
                  {bundle.bonusCredits > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Bonus credits:</span>
                      <span className="font-medium text-green-600">+{formatCredits(bundle.bonusCredits)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCredits(bundle.totalCredits)}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  ${bundle.pricePerMillion.toFixed(2)} per million credits
                  {bundle.pricePerMillion < 1.00 && (
                    <span className="ml-1 text-green-600 font-medium">
                      ({Math.round((1 - bundle.pricePerMillion) * 100)}% savings)
                    </span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(bundle.id);
                  }}
                  disabled={isLoading}
                  className={`
                    w-full rounded-md py-2 px-3 text-sm font-medium
                    ${isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? 'Processing...' : 'Select'}
                </button>
              </div>
            );
          })}
      </div>
      
      {!qualifiesForEnterprise && (
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <h3 className="font-medium text-blue-700 mb-1">Enterprise Tier</h3>
          <p className="text-sm text-blue-600 mb-2">
            Users with monthly usage of 1.4M credits or more qualify for our Enterprise tier,
            which offers our best value at just $0.71 per million credits.
          </p>
          <p className="text-sm text-blue-600">
            Your current monthly usage: {formatCredits(userMonthlyBurn)} credits
          </p>
        </div>
      )}
      
      <div className="mt-8 border-t border-gray-200 pt-4">
        <h3 className="font-medium mb-3">How many prompts can I run?</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-gray-200 rounded-md p-3">
              <div className="font-medium mb-1">GPT-4o</div>
              <div>15,000 credits per medium prompt</div>
              <div className="mt-2">
                {selectedBundle && (
                  <div className="font-medium text-blue-600">
                    {Math.floor(bundles.find(b => b.id === selectedBundle)?.totalCredits || 0 / 15000)} prompts
                  </div>
                )}
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-3">
              <div className="font-medium mb-1">GPT-4o Mini</div>
              <div>1,800 credits per medium prompt</div>
              <div className="mt-2">
                {selectedBundle && (
                  <div className="font-medium text-blue-600">
                    {Math.floor(bundles.find(b => b.id === selectedBundle)?.totalCredits || 0 / 1800)} prompts
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Actual credits per prompt vary based on prompt length and model selection.
            See our <a href="/docs/pricing" className="text-blue-600 hover:underline">pricing page</a> for details.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditBundleSelector;