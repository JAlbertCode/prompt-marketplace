'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/store/usePromptStore';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';
import { Prompt } from '@/types';
import { ArrowLeft, Play, Edit, Eye } from 'lucide-react';
import ExampleModal from '@/components/ui/ExampleModal';

export default function PromptDetailPage({ params }: { params: { promptId: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  
  // Extract promptId in a way that's compatible with React 18's params promise
  const promptId = params?.promptId;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExample, setShowExample] = useState(false);
  
  useEffect(() => {
    // Fetch the prompt data from store
    if (promptId) {
      const promptData = promptStore.getPrompt?.(promptId);
      
      if (promptData) {
        setPrompt(promptData);
      } else {
        console.error('Prompt not found:', promptId);
      }
    }
    
    setLoading(false);
  }, [promptId, promptStore]);
  
  const handleRunClick = () => {
    if (!prompt) return;
    router.push(`/run/${prompt.id}`);
  };
  
  const handleEditClick = () => {
    if (!prompt) return;
    router.push(`/prompt/${prompt.id}/edit`);
  };
  
  const handleBackClick = () => {
    router.push('/');
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
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Prompt Not Found</h2>
          <p className="text-gray-600 mb-6">The prompt you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={handleBackClick}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBackClick}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="mr-1" />
          Back
        </button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowExample(!!prompt.exampleOutput)}
            disabled={!prompt.exampleOutput}
          >
            <Eye className="mr-1" /> 
            View Example
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleEditClick}
          >
            <Edit className="mr-1" /> 
            Edit
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleRunClick}
          >
            <Play className="mr-1" /> 
            Run Prompt
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{prompt.title}</h1>
          <CreditBadge cost={prompt.creditCost} />
        </div>
        <p className="text-gray-600">{prompt.description}</p>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Prompt Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Model</p>
            <p className="font-medium">{prompt.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(prompt.createdAt).toLocaleDateString()}</p>
          </div>
          {prompt.capabilities && (
            <div>
              <p className="text-sm text-gray-500">Capabilities</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {prompt.capabilities.map((capability) => (
                  <span key={capability} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}
          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-500">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {prompt.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {prompt.inputFields && prompt.inputFields.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Input Fields</h2>
          <div className="space-y-4">
            {prompt.inputFields.map((field: any) => (
              <div key={field.id}>
                <p className="font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</p>
                <p className="text-sm text-gray-500">{field.placeholder || 'No placeholder'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* System Prompt (truncated for privacy) */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">System Prompt</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">
            {prompt.systemPrompt ? (
              <>
                {prompt.systemPrompt.substring(0, 150)}
                {prompt.systemPrompt.length > 150 && '...'}
              </>
            ) : (
              'System prompt is hidden. Run this prompt to see it in action.'
            )}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="primary"
          onClick={handleRunClick}
          className="w-full sm:w-auto"
        >
          Run This Prompt
        </Button>
      </div>
      
      {/* Example Modal */}
      <ExampleModal
        isOpen={showExample}
        title={prompt.title}
        content={prompt.exampleOutput || null}
        onClose={() => setShowExample(false)}
      />
    </div>
  );
}
