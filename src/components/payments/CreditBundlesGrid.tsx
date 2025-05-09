"use client";

/**
 * Credit Bundles Grid component
 * 
 * Displays all available credit bundles for purchase
 */

import React from 'react';
import CreditPurchaseCard from './CreditPurchaseCard';
import { getCreditBundles } from '@/lib/credits';

interface Props {
  monthlyBurn?: number; // Current user's monthly burn rate for enterprise eligibility
}

export default function CreditBundlesGrid({ monthlyBurn = 0 }: Props) {
  // Get all available credit bundles
  const bundles = getCreditBundles();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {bundles.map((bundle) => {
        // Determine if this bundle is the enterprise tier and if the user is eligible
        const isEnterprise = bundle.id === 'enterprise';
        const isEligible = !isEnterprise || (monthlyBurn >= (bundle.requiresMonthlyBurn || 0));
        
        // Make "Pro" bundle featured
        const featured = bundle.id === 'pro';
        
        return (
          <CreditPurchaseCard
            key={bundle.id}
            bundleId={bundle.id}
            name={bundle.name}
            price={bundle.price}
            baseCredits={bundle.baseCredits}
            bonusCredits={bundle.bonusCredits}
            totalCredits={bundle.totalCredits}
            pricePerMillion={bundle.pricePerMillion}
            featured={featured}
            requiresMonthlyBurn={bundle.requiresMonthlyBurn}
            isEligible={isEligible}
          />
        );
      })}
    </div>
  );
}
