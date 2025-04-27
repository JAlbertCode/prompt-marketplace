'use client';

import React from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';
import CreditHeader from '@/components/layout/CreditHeader';

export default function HomePage() {
  const { prompts } = usePromptStore();
  
  return (
    <div>
      <CreditHeader />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sonar Prompt Marketplace
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and run optimized prompts powered by Perplexity Sonar
          </p>
        </div>
        
        <Link href="/submit">
          <Button>
            Create Prompt
          </Button>
        </Link>
      </div>
      
      {prompts.length === 0 ? (
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
          {prompts.map((prompt) => (
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
