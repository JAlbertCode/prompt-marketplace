'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, PromptFlow, ItemType } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import PromptBuilder from '@/components/creator/PromptBuilder';
import FlowBuilder from '@/components/creator/FlowBuilder';
import { toast } from 'react-hot-toast';
import { forceReloadStore } from '@/lib/hydrationHelper';

export default function CreatePage({ searchParams }: { searchParams?: { tab?: string, edit?: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  const flowStore = useFlowStore();
  
  const [itemType, setItemType] = useState<ItemType>(searchParams?.tab === 'flow' ? 'flow' : 'prompt');
  const editId = searchParams?.edit;
  
  // Debug on component mount
  
  const handlePromptSave = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    try {
      // Add essential fields for prompt display
      const enrichedPromptData = {
        ...promptData,
        visibility: 'public', // Ensure the prompt is visible
        ownerId: 'current-user',
        creatorId: 'current-user',
        creatorName: 'You',
        // Add other required fields with defaults if not provided
        tags: promptData.tags || [],
        runCount: 0,
        avgRating: 5.0,
        price: 0
      };
      
      // Use promptStore to add the prompt
      const newPromptId = promptStore.addPrompt(enrichedPromptData);
      console.log('Created new prompt with ID:', newPromptId);
      
      // Force refresh local storage and trigger events
      forceReloadStore('prompt-storage');
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Prompt created successfully!');
      
      // Redirect to the dashboard content page instead of home
      setTimeout(() => {
        window.location.href = `/dashboard/content`;
      }, 500);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to create prompt. Please try again.');
    }
  };
  
  const handleFlowSave = (flowData: Omit<PromptFlow, 'id' | 'createdAt'>) => {
    try {
      // Add a mock owner ID for the MVP
      const flowWithOwner = {
        ...flowData,
        ownerId: 'current-user'
      };
      
      const newFlowId = flowStore.addFlow(flowWithOwner);
      
      if (!flowData.isDraft) {
        // If not a draft, set it as published
        flowStore.publishFlow(newFlowId, flowData.unlockPrice);
      }
      
      toast.success(flowData.isDraft 
        ? 'Flow saved as draft!' 
        : 'Flow published successfully!');
      
      // Use direct navigation for reliable page loading
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to create flow. Please try again.');
    }
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.back();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Create New Item</h1>
      
      <div className="mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setItemType('prompt')}
            className={`py-3 px-6 font-medium text-sm ${
              itemType === 'prompt'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Single Prompt
          </button>
          <button
            onClick={() => setItemType('flow')}
            className={`py-3 px-6 font-medium text-sm ${
              itemType === 'flow'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Prompt Flow
          </button>
        </div>
      </div>
      
      {itemType === 'prompt' ? (
        <PromptBuilder 
          onSave={handlePromptSave} 
          onCancel={handleCancel} 
          editId={editId}
        />
      ) : (
        <FlowBuilder 
          onSave={handleFlowSave} 
          onCancel={handleCancel} 
          editId={editId}
        />
      )}
    </div>
  );
}
