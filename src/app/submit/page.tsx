'use client';

import React from 'react';
import PromptCreator from '@/components/ui/PromptCreator';
import CreditHeader from '@/components/layout/CreditHeader';

export default function SubmitPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <CreditHeader />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Prompt
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Design a custom prompt to publish to the marketplace
        </p>
      </div>
      
      <PromptCreator />
    </div>
  );
}
