'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFlowStore } from '@/store/useFlowStore';
import FlowBuilder from '@/components/creator/FlowBuilder';
import { PromptFlow } from '@/types';
import { toast } from 'react-hot-toast';

export default function EditFlowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getFlowById, updateFlow } = useFlowStore();
  
  const [flow, setFlow] = useState<PromptFlow | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (params.id) {
      const flowData = getFlowById?.(params.id);
      if (flowData) {
        // Verify ownership (in a real app, this would check against the logged-in user)
        if (flowData.ownerId !== 'current-user') {
          toast.error("You don't have permission to edit this flow");
          router.push(`/flow/${params.id}`);
          return;
        }
        
        setFlow(flowData);
      } else {
        toast.error("Flow not found");
        router.push('/');
      }
      setLoading(false);
    }
  }, [params.id, getFlowById, router]);
  
  const handleSave = (updatedFlow: Omit<PromptFlow, 'id' | 'createdAt'>) => {
    if (!flow) return;
    
    try {
      updateFlow?.({
        ...updatedFlow,
        id: flow.id,
        createdAt: flow.createdAt
      });
      
      toast.success(updatedFlow.isDraft 
        ? 'Flow saved as draft!' 
        : 'Flow updated successfully!');
      
      // Navigate back to the flow details page
      router.push(`/flow/${params.id}`);
    } catch (error) {
      console.error('Error updating flow:', error);
      toast.error('Failed to update flow. Please try again.');
    }
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push(`/flow/${params.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!flow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Flow Not Found</h1>
        <p className="text-gray-600 mb-6">The flow you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Edit Flow: {flow.title}</h1>
      
      <FlowBuilder 
        initialFlow={flow}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
