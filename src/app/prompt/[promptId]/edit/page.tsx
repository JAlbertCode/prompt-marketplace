'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/store/usePromptStore';
import PromptBuilder from '@/components/creator/PromptBuilder';
import { Prompt } from '@/types';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function EditPromptPage({ params }: { params: { promptId: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  
  // Extract promptId safely
  const promptId = params?.promptId;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log('Edit page mounting with promptId:', promptId);
    
    // Fetch the prompt data from store
    if (promptId) {
      const promptData = promptStore.getPrompt?.(promptId);
      console.log('Prompt data loaded from store:', promptData ? 'Found' : 'Not found');
      console.log('Raw prompt data:', JSON.stringify(promptData, null, 2));
      
      if (promptData) {
        console.log('Setting prompt state with data:', JSON.stringify(promptData, null, 2));
        
        // Ensure we have all needed fields correctly formatted for the form
        const formattedPrompt: Prompt = {
          ...promptData,
          // Make sure these critical fields exist
          id: promptData.id,
          title: promptData.title || '',
          description: promptData.description || '',
          inputFields: promptData.inputFields || [],
          systemPrompt: promptData.systemPrompt || promptData.content || '',
          model: promptData.model || 'gpt-4o',
          creditCost: typeof promptData.creditCost === 'number' ? promptData.creditCost : 0,
          creatorFee: typeof promptData.creatorFee === 'number' ? promptData.creatorFee : 0,
          capabilities: Array.isArray(promptData.capabilities) ? promptData.capabilities : ['text'],
          outputType: promptData.outputType || 'text',
          createdAt: promptData.createdAt || Date.now(),
          
          // Preserve these fields if they exist
          visibility: promptData.visibility,
          creatorId: promptData.creatorId || promptData.ownerId,
          creatorName: promptData.creatorName,
          tags: promptData.tags,
          runCount: promptData.runCount,
          avgRating: promptData.avgRating,
          
          // Add a helper function for backwards compatibility
          getSystemPrompt: () => promptData.systemPrompt || promptData.content || ''
        };
        
        setPrompt(formattedPrompt);
      } else {
        console.error('Prompt not found for editing:', promptId);
        toast.error('Prompt not found');
        router.push('/dashboard/content');
      }
    }
    
    setLoading(false);
  }, [promptId, promptStore, router]);
  
  const handlePromptUpdate = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    try {
      if (!prompt) return;
      
      console.log('Updating prompt with new data:', JSON.stringify(promptData, null, 2));
      console.log('Original prompt data:', JSON.stringify(prompt, null, 2));
      
      // Create a merged update that preserves fields not in the form
      const updateData = {
        ...promptData,
        
        // Ensure these fields are always included
        systemPrompt: promptData.systemPrompt || '',
        inputFields: Array.isArray(promptData.inputFields) ? promptData.inputFields.map(field => ({
          ...field,
          // Normalize field properties
          required: field.required !== undefined ? field.required : true,
          type: field.type || 'text',
          placeholder: field.placeholder || ''
        })) : [],
        model: promptData.model || 'gpt-4o',
        creditCost: promptData.creditCost || 0,
        creatorFee: promptData.creatorFee || 0,
        capabilities: Array.isArray(promptData.capabilities) ? promptData.capabilities : ['text'],
        outputType: promptData.outputType || 'text',
        
        // Keep these fields from the original prompt if they exist
        visibility: prompt.visibility,
        creatorId: prompt.creatorId || prompt.ownerId,
        creatorName: prompt.creatorName,
        tags: prompt.tags || [],
        runCount: prompt.runCount || 0,
        avgRating: prompt.avgRating || 0,
        
        // Always clear this deprecated field to avoid confusion
        content: undefined
      };
      
      console.log('Final update data:', JSON.stringify(updateData, null, 2));
      
      // Update the prompt with the new data
      promptStore.updatePrompt?.(prompt.id, updateData);
      
      // Verify the update by getting the prompt again
      const updatedPrompt = promptStore.getPrompt?.(prompt.id);
      console.log('Prompt after update:', JSON.stringify(updatedPrompt, null, 2));
      
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
        router.push('/dashboard/content');
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
        initialPrompt={prompt}
        editId={promptId} // Pass the ID explicitly
      />
    </div>
  );
}
