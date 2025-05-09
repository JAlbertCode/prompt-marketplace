'use client';

import React from 'react';
import ModelGrid from '@/components/shared/ModelGrid';
import { useCreditStore } from '@/store/useCreditStore';
import { useEffect } from 'react';

export default function ModelsPage() {
  const { credits, fetchCredits } = useCreditStore();
  
  // Fetch the user's credits when the page loads
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">AI Models</h1>
      
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Browse all available AI models on the PromptFlow platform.
          Prices shown are in credits (1 credit = $0.000001).
        </p>
        
        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-md">
          <span className="text-blue-600 mr-2">💎</span>
          <span className="font-medium">{credits.toLocaleString()} credits</span>
        </div>
      </div>
      
      <ModelGrid showPricing={true} />
    </div>
  );
}