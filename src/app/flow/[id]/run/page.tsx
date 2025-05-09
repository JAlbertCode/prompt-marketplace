'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/store/useFlowStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import FlowRunner from '@/components/runner/FlowRunner';
import { PromptFlow } from '@/types';
import { toast } from 'react-hot-toast';

export default function RunFlowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getFlowById } = useFlowStore();
  const { hasUnlockedFlow } = useUnlockedFlowStore();
  
  const [flow, setFlow] = useState<PromptFlow | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (params.id) {
      const flowData = getFlowById?.(params.id);
      if (flowData) {
        setFlow(flowData);
        
        // Check if flow is unlocked
        const isUnlocked = hasUnlockedFlow(flowData.id);
        
        // If flow requires unlocking and isn't unlocked, redirect
        if (flowData.unlockPrice && flowData.unlockPrice > 0 && !isUnlocked) {
          toast.error("You need to unlock this flow before running it");
          router.push(`/flow/${params.id}`);
          return;
        }
      } else {
        toast.error("Flow not found");
        router.push('/');
      }
      setLoading(false);
    }
  }, [params.id, getFlowById, hasUnlockedFlow, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!flow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Flow Not Found</h1>
        <p className="text-gray-600 mb-6">The flow you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/flow/${params.id}`)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Flow Details
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-2">{flow.title}</h1>
        <p className="text-gray-600 mb-4">{flow.description}</p>
        
        <div className="p-2 bg-indigo-50 rounded-md mb-4">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">Total Cost:</span> {flow.totalCreditCost} credits
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Run Flow</h2>
        <FlowRunner flow={flow} />
      </div>
    </div>
  );
}
