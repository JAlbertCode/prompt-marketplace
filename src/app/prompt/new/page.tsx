'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CreatePromptForm from '@/components/ui/prompts/CreatePromptForm';

export default function NewPromptPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 flex items-center gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <h1 className="text-2xl font-semibold mb-6">Create New Prompt</h1>
      
      <CreatePromptForm />
    </div>
  );
}
