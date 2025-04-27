'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import PromptForm from '@/components/ui/PromptForm';
import WebhookDisplay from '@/components/ui/WebhookDisplay';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CreditHeader from '@/components/layout/CreditHeader';

interface PromptRunPageProps {
  params: {
    promptId: string;
  };
}

export default function PromptRunPage({ params }: PromptRunPageProps) {
  // Access params directly without using React.use()
  const { promptId } = params;
  const router = useRouter();
  const promptStore = usePromptStore();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load the prompt
    if (promptStore && typeof promptStore.getPrompt === 'function') {
      const foundPrompt = promptStore.getPrompt(promptId);
      
      if (foundPrompt) {
        setPrompt(foundPrompt);
      } else {
        console.error(`Prompt with ID ${promptId} not found`);
      }
    } else {
      console.error('getPrompt function is not available');
    }
    
    setLoading(false);
  }, [promptId, promptStore]);
  
  const handleReturn = () => {
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingIndicator size="lg" />
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Prompt Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The prompt you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={handleReturn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Back to Prompts
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* <CreditHeader /> */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Run Prompt
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the required inputs and run the prompt
        </p>
      </div>
      
      <div className="space-y-6">
        <PromptForm 
          prompt={prompt} 
          onReturn={handleReturn} 
        />
        
        <WebhookDisplay 
          promptId={prompt.id} 
        />
      </div>
    </div>
  );
}
