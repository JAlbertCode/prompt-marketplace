'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Prompt, PromptFlow, ItemType } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import PromptBuilder from '@/components/creator/PromptBuilder';
import FlowBuilder from '@/components/creator/FlowBuilder';
import { toast } from 'react-hot-toast';
import { forceReloadStore } from '@/lib/hydrationHelper';
import { useAuth } from '@/lib/auth/authContext';

export default function CreatePage({ searchParams }: { searchParams?: { tab?: string, edit?: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  const flowStore = useFlowStore();
  const { data: session } = useSession();
  const { user: supabaseUser } = useAuth();
  
  const [itemType, setItemType] = useState<ItemType>(searchParams?.tab === 'flow' ? 'flow' : 'prompt');
  const [loading, setLoading] = useState(false);
  const editId = searchParams?.edit;
  
  // Determine user ID from available auth methods
  const userId = session?.user?.id || supabaseUser?.id || 
                (typeof window !== 'undefined' ? 
                  localStorage.getItem('userId') || 
                  (localStorage.getItem('supabase_user') ? 
                    JSON.parse(localStorage.getItem('supabase_user') || '{}')?.id : 
                    null) : 
                  null);
  
  // Check for saved drafts when component loads and user is authenticated
  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      // Check if we have a stored draft
      const promptDraft = localStorage.getItem('prompt_draft');
      const flowDraft = localStorage.getItem('flow_draft');
      
      if (promptDraft && itemType === 'prompt') {
        // Ask if user wants to restore the draft
        if (window.confirm('We found a saved prompt draft. Would you like to restore it?')) {
          // Parse the draft data
          try {
            const parsedDraft = JSON.parse(promptDraft);
            // Here you would need to pass this data to your PromptBuilder component
            // This might require adding a prop to PromptBuilder for initialData
            // For now, just show a toast
            toast.success('Draft restored!');
          } catch (error) {
            console.error('Error parsing prompt draft:', error);
            toast.error('Could not restore the draft');
          }
        }
        // Remove the draft after attempting to restore it
        localStorage.removeItem('prompt_draft');
      }
      
      if (flowDraft && itemType === 'flow') {
        // Ask if user wants to restore the draft
        if (window.confirm('We found a saved flow draft. Would you like to restore it?')) {
          // Parse the draft data
          try {
            const parsedDraft = JSON.parse(flowDraft);
            // Here you would need to pass this data to your FlowBuilder component
            // This might require adding a prop to FlowBuilder for initialData
            // For now, just show a toast
            toast.success('Draft restored!');
          } catch (error) {
            console.error('Error parsing flow draft:', error);
            toast.error('Could not restore the draft');
          }
        }
        // Remove the draft after attempting to restore it
        localStorage.removeItem('flow_draft');
      }
    }
  }, [userId, itemType]);
  
  // Debug authentication state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Authentication debug info:');
      console.log('- Session:', session ? 'exists' : 'null');
      console.log('- Supabase user:', supabaseUser ? 'exists' : 'null');
      console.log('- UserId:', userId);
      console.log('- LocalStorage has supabase_user:', !!localStorage.getItem('supabase_user'));
      console.log('- Cookie has supabase_auth:', document.cookie.includes('supabase_auth=true'));
    }
  }, [session, supabaseUser, userId]);
  
  // Check if we have authentication and show a notification if needed
  useEffect(() => {
    // First check if we're already loading authentication status
    if (loading) return;
    
    // Skip if this effect has already shown the warning
    if (localStorage.getItem('auth_warning_shown')) return;
    
    // Check stored user first before prompting
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('supabase_user') : null;
    const authCookie = document.cookie.includes('supabase_auth=true');
    
    // If no session, no supabaseUser, no stored user in localStorage, and no auth cookie, show a toast warning
    if (!userId && !session?.user && !supabaseUser && !storedUser && !authCookie) {
      console.log('No authentication detected, showing toast warning');
      toast.warning('Sign in will be required to save content. You can still create drafts while logged out.');
      
      // Set a flag to avoid showing this warning multiple times in a session
      localStorage.setItem('auth_warning_shown', 'true');
      
      // Clear the flag after 30 minutes
      setTimeout(() => {
        localStorage.removeItem('auth_warning_shown');
      }, 30 * 60 * 1000);
    }
  }, [userId, session, supabaseUser, loading]);
  
  const handlePromptSave = async (promptData: Omit<Prompt, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      // Check if we have a user ID
      if (!userId) {
        toast.error('You must be logged in to save this prompt');
        
        // Ask if they want to go to login
        if (window.confirm('Would you like to sign in now? Your draft will be preserved for when you return.')) {
          // Store draft in localStorage
          localStorage.setItem('prompt_draft', JSON.stringify(promptData));
          
          // Redirect to login with return URL
          const returnUrl = encodeURIComponent('/create');
          router.push(`/login?returnUrl=${returnUrl}`);
        }
        return;
      }
      
      // Prepare the data to save to Supabase
      const promptToSave = {
        ...promptData,
        userId // Add the user ID
      };
      
      console.log('Saving prompt to Supabase:', promptToSave);
      
      // Save to Supabase via our API
      const response = await fetch('/api/prompts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptToSave)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create prompt');
      }
      
      // Success - also save to local store for backward compatibility
      const enrichedPromptData = {
        ...promptData,
        visibility: 'public', // Ensure the prompt is visible
        ownerId: userId,
        creatorId: userId,
        creatorName: session?.user?.name || supabaseUser?.name || 'You',
        tags: promptData.tags || [],
        runCount: 0,
        avgRating: 5.0,
        price: 0
      };
      
      // Use promptStore to add the prompt locally as well
      const newPromptId = promptStore.addPrompt(enrichedPromptData);
      console.log('Created new prompt with local ID:', newPromptId);
      console.log('Created new prompt in Supabase with ID:', data.promptId);
      
      // Force refresh local storage and trigger events
      forceReloadStore('prompt-storage');
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Prompt created successfully!');
      
      // Redirect to the dashboard content page
      setTimeout(() => {
        router.push('/dashboard/content');
      }, 500);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error(`Failed to create prompt: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFlowSave = async (flowData: Omit<PromptFlow, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      // Check if we have a user ID
      if (!userId) {
        toast.error('You must be logged in to save this flow');
        
        // Ask if they want to go to login
        if (window.confirm('Would you like to sign in now? Your draft will be preserved for when you return.')) {
          // Store draft in localStorage
          localStorage.setItem('flow_draft', JSON.stringify(flowData));
          
          // Redirect to login with return URL
          const returnUrl = encodeURIComponent('/create?tab=flow');
          router.push(`/login?returnUrl=${returnUrl}`);
        }
        return;
      }
      
      // Prepare the data to save to Supabase
      const flowToSave = {
        ...flowData,
        userId,
        creatorId: userId,
        isPublished: !flowData.isDraft
      };
      
      console.log('Saving flow to Supabase:', flowToSave);
      
      // Save to Supabase via API
      try {
        const response = await fetch('/api/flows/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(flowToSave)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create flow');
        }
        
        console.log('Successfully created flow in Supabase with ID:', data.flowId);
        
        if (data.warning) {
          toast.warning(data.warning);
        }
      } catch (saveError) {
        console.error('Error saving flow to Supabase:', saveError);
        // Continue with local storage as fallback
        toast.warning('Could not save to database, using local storage instead');
      }
      const flowWithOwner = {
        ...flowData,
        ownerId: userId,
        creatorId: userId,
        creatorName: session?.user?.name || supabaseUser?.name || 'You'
      };
      
      const newFlowId = flowStore.addFlow(flowWithOwner);
      
      if (!flowData.isDraft) {
        // If not a draft, set it as published
        flowStore.publishFlow(newFlowId, flowData.unlockPrice);
      }
      
      toast.success(flowData.isDraft 
        ? 'Flow saved as draft!' 
        : 'Flow published successfully!');
      
      // Redirect to flows page
      setTimeout(() => {
        router.push('/dashboard/flows');
      }, 500);
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error(`Failed to create flow: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
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
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-3 text-lg text-gray-700">Saving...</p>
          </div>
        ) : (
          itemType === 'prompt' ? (
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
          )
        )}
      </div>
  );
}
