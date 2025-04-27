'use client';

import React from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const promptStore = usePromptStore();
  const { prompts, resetStore } = promptStore;
  
  const resetPromptStore = () => {
    if (window.confirm('This will reset the prompt store to its initial state. Any custom prompts will be lost. Continue?')) {
      if (resetStore && typeof resetStore === 'function') {
        resetStore();
        toast.success('Prompt store reset successfully');
      } else {
        // Fallback if function is not available
        localStorage.removeItem('prompt-storage');
        window.location.reload();
        toast.success('Prompt store reset successfully');
      }
    }
  };
  
  return (
    <div>
      {/* <CreditHeader /> */}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sonar Prompt Marketplace
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and run optimized prompts powered by Perplexity Sonar
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={resetPromptStore}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Reset Prompts
          </button>
          <Link href="/submit">
          <Button>
            Create Prompt
          </Button>
        </Link>
        </div>
      </div>
      
      {Array.isArray(prompts) && prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No prompts available yet.
          </p>
          <Link href="/submit">
            <Button>
              Create Your First Prompt
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(prompts) && prompts.map((prompt) => (
            <PromptCard 
              key={prompt.id} 
              prompt={prompt} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
