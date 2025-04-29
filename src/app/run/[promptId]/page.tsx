'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Prompt, PromptFlow, ItemType } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import PromptForm from '@/components/ui/PromptForm';
import FlowRunner from '@/components/runner/FlowRunner';
import WebhookDisplay from '@/components/ui/WebhookDisplay';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CreditHeader from '@/components/layout/CreditHeader';

interface Params {
  promptId: string;
}

export default function RunPage({ params }: { params: Params }) {
  const { promptId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemType = (searchParams?.get('type') as ItemType) || 'prompt';
  
  const promptStore = usePromptStore();
  const flowStore = useFlowStore();
  const unlockedFlowStore = useUnlockedFlowStore();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [flow, setFlow] = useState<PromptFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    setPrompt(null);
    setFlow(null);
    
    // Load the requested item based on type
    if (itemType === 'prompt') {
      // Load prompt
      if (promptStore && typeof promptStore.getPrompt === 'function') {
        const foundPrompt = promptStore.getPrompt(promptId);
        
        if (foundPrompt) {
          setPrompt(foundPrompt);
        } else {
          setError(`Prompt with ID ${promptId} not found`);
        }
      } else {
        setError('Prompt store is not available');
      }
    } else if (itemType === 'flow') {
      // Load flow
      if (flowStore && typeof flowStore.getFlow === 'function') {
        const foundFlow = flowStore.getFlow(promptId);
        
        if (foundFlow) {
          // Check if the flow is locked
          const isLocked = foundFlow.unlockPrice > 0 && 
                          !unlockedFlowStore.isFlowUnlocked(promptId);
          
          if (isLocked) {
            setError(`This flow requires ${foundFlow.unlockPrice} credits to unlock first.`);
          } else {
            setFlow(foundFlow);
          }
        } else {
          setError(`Flow with ID ${promptId} not found`);
        }
      } else {
        setError('Flow store is not available');
      }
    } else {
      setError('Invalid item type specified');
    }
    
    setLoading(false);
  }, [promptId, itemType, promptStore, flowStore, unlockedFlowStore]);
  
  const handleReturn = () => {
    // Check if we can go back in history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home page
      router.push('/');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingIndicator size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Error
        </h2>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <button
          onClick={handleReturn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }
  
  if (!prompt && !flow) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Item Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The {itemType} you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={handleReturn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <nav className="flex mb-4 text-sm text-gray-500">
        <button onClick={() => router.push('/')} className="hover:text-blue-600 hover:underline">Home</button>
        <span className="mx-2">›</span>
        <span className="text-gray-700 font-medium">{itemType === 'prompt' ? prompt?.title || 'Run Prompt' : flow?.name || 'Execute Flow'}</span>
      </nav>
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {itemType === 'prompt' ? 'Run Prompt' : 'Execute Flow'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {itemType === 'prompt' 
            ? 'Fill in the required inputs and run the prompt' 
            : 'Complete the required inputs and execute the flow sequence'}
        </p>
      </div>
      
      <div className="space-y-6">
        {prompt && (
          <PromptForm 
            prompt={prompt} 
            onReturn={handleReturn} 
          />
        )}
        
        {flow && (
          <FlowRunner
            flow={flow}
            onReturn={handleReturn}
          />
        )}
        
        {prompt && (
          <WebhookDisplay 
            promptId={prompt.id} 
          />
        )}
      </div>
    </div>
  );
}
