import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ModelCostsTable from '@/components/credits/ModelCostsTable';

export const metadata = {
  title: 'Model Pricing - PromptFlow',
  description: 'View pricing for all available AI models on PromptFlow',
};

export default async function ModelPricingPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits/pricing');
  }
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Model Pricing</h1>
        <p className="text-gray-600 mt-1">
          Compare pricing across all available models
        </p>
      </div>
      
      {/* Pricing comparison */}
      <div className="mb-8">
        <ModelCostsTable showDetails={true} />
      </div>
      
      {/* Additional information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Pricing Information</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Credit System</h3>
            <p className="text-gray-600 mb-2">
              PromptFlow uses a credit-based system where 1 credit = $0.000001 USD.
              This means 1 million credits = $1 USD.
            </p>
            <p className="text-gray-600">
              Credits are used for all API calls, with different models having different credit costs.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Prompt Length Categories</h3>
            <div className="relative overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="text-xs bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th scope="col" className="px-6 py-3">Category</th>
                    <th scope="col" className="px-6 py-3">OpenAI</th>
                    <th scope="col" className="px-6 py-3">Sonar</th>
                    <th scope="col" className="px-6 py-3">Approximate Words</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-6 py-4 font-medium">Short</td>
                    <td className="px-6 py-4">≤ 1,000 tokens</td>
                    <td className="px-6 py-4">≤ 800 tokens</td>
                    <td className="px-6 py-4">Up to 750 words</td>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <td className="px-6 py-4 font-medium">Medium</td>
                    <td className="px-6 py-4">1,001-4,000 tokens</td>
                    <td className="px-6 py-4">801-3,000 tokens</td>
                    <td className="px-6 py-4">750-3,000 words</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-medium">Long</td>
                    <td className="px-6 py-4">4,001+ tokens</td>
                    <td className="px-6 py-4">3,001+ tokens</td>
                    <td className="px-6 py-4">3,000+ words</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Creator Fees</h3>
            <p className="text-gray-600">
              When running prompts or flows created by others, additional creator fees may apply.
              80% of creator fees are paid to the prompt creator.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Billing Cycle</h3>
            <p className="text-gray-600">
              Credits are deducted in real-time as you use the platform.
              Credits never expire and can be used at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
