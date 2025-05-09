'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/store/useFlowStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import { useCreditStore } from '@/store/useCreditStore';
import { usePromptStore } from '@/store/usePromptStore';
import Button from '@/components/shared/Button';
import { PromptFlow, Prompt } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function FlowDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getFlowById } = useFlowStore();
  const { hasUnlockedFlow, unlockFlow } = useUnlockedFlowStore();
  const { credits, deductCredits } = useCreditStore();
  const { getPromptById } = usePromptStore();
  
  const [flow, setFlow] = useState<PromptFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});
  
  const isUnlocked = flow ? hasUnlockedFlow(flow.id) : false;
  const canEdit = flow?.ownerId === 'current-user'; // In a real app, this would check the actual user ID
  
  useEffect(() => {
    if (params.id) {
      const flowData = getFlowById?.(params.id);
      if (flowData) {
        setFlow(flowData);
        
        // Load prompt data for each step
        const promptsMap: Record<string, Prompt> = {};
        flowData.steps.forEach(step => {
          const prompt = getPromptById?.(step.promptId);
          if (prompt) {
            promptsMap[prompt.id] = prompt;
          }
        });
        
        setPrompts(promptsMap);
      } else {
        toast.error("Flow not found");
        router.push('/');
      }
      setLoading(false);
    }
  }, [params.id, getFlowById, getPromptById]);
  
  const handleUnlock = () => {
    if (!flow) return;
    
    if (flow.unlockPrice && flow.unlockPrice > 0) {
      if (credits < flow.unlockPrice) {
        toast.error(`Not enough credits. You need ${flow.unlockPrice} credits to unlock this flow.`);
        return;
      }
      
      if (window.confirm(`Unlock this flow for ${flow.unlockPrice} credits?`)) {
        deductCredits(flow.unlockPrice);
        unlockFlow(flow.id);
        toast.success(`Flow unlocked for ${flow.unlockPrice} credits!`);
      }
    } else {
      // Free flow
      unlockFlow(flow.id);
      toast.success("Flow unlocked!");
    }
  };
  
  const handleRunFlow = () => {
    router.push(`/flow/${params.id}/run`);
  };
  
  const handleEditFlow = () => {
    router.push(`/flow/${params.id}/edit`);
  };
  
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
          onClick={() => router.push('/')}
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{flow.title}</h1>
            <p className="text-gray-600">{flow.description}</p>
          </div>
          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={handleEditFlow}
                className="px-3 py-1 text-sm border border-indigo-500 text-indigo-500 rounded hover:bg-indigo-50"
              >
                Edit Flow
              </button>
            )}
          </div>
        </div>
        
        {flow.isDraft && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-yellow-700">This flow is a draft</span>
            </div>
            <p className="mt-1 text-sm text-yellow-600 ml-7">
              Draft flows are not visible to others and are still being developed.
            </p>
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50 rounded-md">
            <p className="text-sm text-indigo-800">
              <span className="font-medium">Total Cost:</span> {flow.totalCreditCost} credits per execution
            </p>
          </div>
          
          {flow.unlockPrice && flow.unlockPrice > 0 && (
            <div className="p-4 bg-orange-50 rounded-md">
              <p className="text-sm text-orange-800">
                <span className="font-medium">Unlock Price:</span> {flow.unlockPrice} credits
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Flow Steps</h2>
        
        {flow.steps.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-gray-600">This flow doesn't have any steps yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flow.steps.map((step, index) => {
              const prompt = prompts[step.promptId];
              if (!prompt) return null;
              
              return (
                <div key={step.id} className="border border-gray-200 rounded-md p-4 relative">
                  <div className="absolute top-0 left-0 -mt-3 -ml-1 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  
                  <div className="mb-2 mt-1">
                    <h3 className="font-medium">{step.title || prompt.title}</h3>
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                  </div>
                  
                  {isUnlocked || canEdit ? (
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Cost: {prompt.creditCost} credits</p>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-gray-400">
                      <p>Unlock this flow to see more details.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          {!isUnlocked && flow.unlockPrice && flow.unlockPrice > 0 ? (
            <button
              onClick={handleUnlock}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Unlock Flow ({flow.unlockPrice} credits)
            </button>
          ) : null}
        </div>
        
        <Button
          onClick={handleRunFlow}
          disabled={!isUnlocked && flow.unlockPrice && flow.unlockPrice > 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Run Flow
        </Button>
      </div>
    </div>
  );
}
