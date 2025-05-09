'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Prompt, PromptFlow } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import { getDollarCostPerRun } from '@/lib/models/modelRegistry';

// Mock unlocked items data
const mockUnlockedItems = [
  {
    id: 'unlocked-1',
    type: 'flow',
    flowId: 'flow-1',
    unlockDate: new Date(2025, 4, 1),
    unlockFee: 50000,
  },
  {
    id: 'unlocked-2',
    type: 'prompt',
    promptId: 'prompt-1',
    unlockDate: new Date(2025, 4, 15),
    unlockFee: 25000,
  },
  {
    id: 'unlocked-3',
    type: 'flow',
    flowId: 'flow-2',
    unlockDate: new Date(2025, 4, 20),
    unlockFee: 75000,
  }
];

const UnlockedItemsPage: React.FC = () => {
  const { data: session } = useSession();
  const { getPrompt } = usePromptStore();
  const { getFlow } = useFlowStore();
  
  const [unlockedItems, setUnlockedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we'd fetch this from the API
    // For now, we'll use mock data
    setTimeout(() => {
      setUnlockedItems(mockUnlockedItems);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (unlockedItems.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Unlocked Items</h2>
        <p className="text-gray-600 mb-6">
          You haven't unlocked any premium prompts or flows yet.
        </p>
        <Link 
          href="/marketplace"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Unlocked Items</h2>
      
      <div className="space-y-4">
        {unlockedItems.map(item => {
          // In a real app, we'd fetch the actual prompt or flow data
          // For now, we'll create mock data based on the ID
          const itemDetails = item.type === 'prompt' 
            ? getPrompt?.(item.promptId) || { 
                id: item.promptId, 
                title: `Prompt ${item.promptId}`,
                description: 'A premium prompt you\'ve unlocked',
                model: 'gpt-4o',
                creatorFee: 5000
              }
            : getFlow?.(item.flowId) || {
                id: item.flowId,
                title: `Flow ${item.flowId}`,
                description: 'A premium flow you\'ve unlocked',
                steps: [{ model: 'gpt-4o' }]
              };
              
          const modelId = item.type === 'prompt' 
            ? itemDetails.model 
            : itemDetails.steps[0].model;
            
          const estimatedRunCost = getDollarCostPerRun(modelId, 
            item.type === 'prompt' ? itemDetails.creatorFee : 0);
          
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                      item.type === 'prompt' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type === 'prompt' ? 'Prompt' : 'Flow'}
                    </span>
                    <h3 className="text-sm font-medium text-gray-900">
                      {itemDetails.title}
                    </h3>
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-500">{itemDetails.description}</p>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <div>
                      Unlocked: {item.unlockDate.toLocaleDateString()}
                    </div>
                    <div>
                      Unlock Fee: ${(item.unlockFee / 1000000).toFixed(6)}
                    </div>
                    <div>
                      Est. Run Cost: ${estimatedRunCost.toFixed(6)}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={item.type === 'prompt' ? `/run/${itemDetails.id}` : `/flow/${itemDetails.id}/run`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Run
                  </Link>
                  
                  <Link
                    href={item.type === 'prompt' ? `/prompt/${itemDetails.id}/clone` : `/flow/${itemDetails.id}/clone`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clone
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">About Unlocked Items</h3>
        <p className="text-xs text-gray-600">
          These are premium prompts and flows you've purchased access to. You can run them without 
          additional unlock fees (standard run costs still apply). You can also clone them to create 
          your own versions.
        </p>
      </div>
    </div>
  );
};

export default UnlockedItemsPage;
