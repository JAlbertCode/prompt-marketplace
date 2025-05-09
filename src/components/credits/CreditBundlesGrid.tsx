"use client";

import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { creditPackages, getRecommendedPackage } from '@/lib/creditHelpers';
import Link from 'next/link';

interface CreditBundlesGridProps {
  monthlyBurn: number;
}

export default function CreditBundlesGrid({ monthlyBurn }: CreditBundlesGridProps) {
  const recommendedPackage = getRecommendedPackage(monthlyBurn);
  
  // Filter out enterprise package for regular display
  const standardPackages = creditPackages.filter(pkg => pkg.id !== 'enterprise');
  
  // Format large numbers for display
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {standardPackages.map((pkg) => {
          const isRecommended = pkg.id === recommendedPackage;
          const totalCredits = pkg.baseAmount + pkg.bonusAmount;
          const pricePerMillion = (pkg.price / (totalCredits / 1_000_000)).toFixed(2);
          
          return (
            <div 
              key={pkg.id} 
              className={`border rounded-lg p-5 transition-all ${
                isRecommended 
                  ? 'border-blue-500 shadow-md bg-blue-50' 
                  : 'hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              {isRecommended && (
                <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                  Recommended
                </div>
              )}
              
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <p className="text-gray-600 text-sm my-1">{pkg.description}</p>
              
              <div className="mt-4 mb-2 flex items-baseline">
                <span className="text-2xl font-bold">${pkg.price}</span>
                <span className="text-gray-500 text-sm ml-1">USD</span>
              </div>
              
              <div className="space-y-2 mt-3 mb-4">
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    <span className="font-medium">{formatNumber(pkg.baseAmount)}</span> base credits
                  </span>
                </div>
                
                {pkg.bonusAmount > 0 && (
                  <div className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm">
                      <span className="font-medium text-green-600">+{formatNumber(pkg.bonusAmount)}</span> bonus credits
                    </span>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    ${pricePerMillion} per million credits
                  </span>
                </div>
              </div>
              
              <button className={`w-full py-2 rounded-md font-medium ${
                isRecommended 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-600'
              }`}>
                Purchase
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Enterprise section */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-xl font-bold">Enterprise Plan</h3>
            <p className="text-gray-600 mt-1">
              For organizations with high volume needs. Get additional bonuses and dedicated support.
            </p>
          </div>
          
          <Link
            href="/enterprise"
            className="mt-4 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact sales <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <h4 className="font-medium">Enterprise Credits</h4>
            <p className="text-sm text-gray-600 mt-1">
              100M base + 40M bonus credits for high-volume users
            </p>
          </div>
          
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <h4 className="font-medium">Automatic Upgrades</h4>
            <p className="text-sm text-gray-600 mt-1">
              Auto-upgrade when usage exceeds 1.4M monthly
            </p>
          </div>
          
          <div className="bg-white rounded-md p-4 border border-gray-200">
            <h4 className="font-medium">Priority Support</h4>
            <p className="text-sm text-gray-600 mt-1">
              Dedicated account manager and priority support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
