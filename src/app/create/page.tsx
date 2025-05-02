'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prompt, PromptFlow, ItemType } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import PromptBuilder from '@/components/creator/PromptBuilder';
import FlowBuilder from '@/components/creator/FlowBuilder';
import { toast } from 'react-hot-toast';

export default function CreatePage({ searchParams }: { searchParams?: { tab?: string, edit?: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  const flowStore = useFlowStore();
  
  const [itemType, setItemType] = useState<ItemType>(searchParams?.tab === 'flow' ? 'flow' : 'prompt');
  const editId = searchParams?.edit;
  
  const handlePromptSave = (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    try {
      // Add a mock owner ID for the MVP
      const promptWithOwner = {
        ...promptData,
        ownerId: 'current-user'
      };
      
      const newPromptId = promptStore.addPrompt(promptWithOwner);
      
      toast.success('Prompt created successfully!');
      
      // Navigate to the prompt page
      router.push(`/`);
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
      
      // Navigate to the home page
      router.push('/');
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
