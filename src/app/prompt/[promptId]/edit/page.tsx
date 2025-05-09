'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/store/usePromptStore';
import PromptBuilder from '@/components/creator/PromptBuilder';
import { Prompt } from '@/types';
import { toast } from 'react-hot-toast';

export default function EditPromptPage({ params }: { params: { promptId: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  
  // Extract promptId safely
  const promptId = params?.promptId;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch the prompt data from store
    if (promptId) {
      const promptData = promptStore.getPrompt?.(promptId);
      
      if (promptData) {
        setPrompt(promptData);
      } else {
        console.error('Prompt not found for editing:', promptId);
        toast.error('Prompt not found');
        router.push('/');
      }
    }
    
    setLoading(false);
  }, [promptId, promptStore, router]);
  
  const handlePromptUpdate = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    try {
      if (!prompt) return;
      
      // Update the prompt with the new data
      promptStore.updatePrompt?.(prompt.id, promptData);
      
      toast.success('Prompt updated successfully!');
      
      // Navigate back to the prompt detail page
      router.push(`/prompt/${prompt.id}`);
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast.error('Failed to update prompt. Please try again.');
    }
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      if (prompt) {
        router.push(`/prompt/${prompt.id}`);
      } else {
        router.push('/');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Prompt Not Found</h2>
          <p className="text-gray-600 mb-6">The prompt you're trying to edit doesn't exist or has been removed.</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => router.push('/')}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Edit Prompt</h1>
      
      <PromptBuilder 
        onSave={handlePromptUpdate} 
        onCancel={handleCancel} 
        initialData={prompt}
      />
    </div>
  );
}
