'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import ImageTransformer from '@/components/transformer/ImageTransformer';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface Params {
  promptId: string;
}

export default function TransformPage({ params }: { params: Params }) {
  const { promptId } = params;
  const router = useRouter();
  const promptStore = usePromptStore();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Load the requested prompt
    if (promptStore && typeof promptStore.getPrompt === 'function') {
      const foundPrompt = promptStore.getPrompt(promptId);
      
      if (foundPrompt) {
        // Check if this is a transformation prompt
        if (foundPrompt.capabilities?.includes('transformation')) {
          setPrompt(foundPrompt);
        } else {
          setError(`Prompt with ID ${promptId} is not a transformation prompt`);
        }
      } else {
        setError(`Prompt with ID ${promptId} not found`);
      }
    } else {
      setError('Prompt store is not available');
    }
    
    setLoading(false);
  }, [promptId, promptStore]);
  
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
  
  if (!prompt) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Prompt Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The transformation prompt you're looking for doesn't exist or has been removed.
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
        <button onClick={() => router.push('/')} className="hover:text-blue-600 hover:underline">
          Home
        </button>
        <span className="mx-2">›</span>
        <span className="text-gray-700 font-medium">
          {prompt.title}
        </span>
      </nav>
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Image Transformation
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload an image and transform it based on your selected style
        </p>
      </div>
      
      <div className="space-y-6">
        <ImageTransformer 
          prompt={prompt} 
          onCancel={handleReturn} 
        />
      </div>
    </div>
  );
}
