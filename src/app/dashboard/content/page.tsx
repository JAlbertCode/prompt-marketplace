'use client';

import React, { useState, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import Link from 'next/link';
import { forceReloadStore } from '@/lib/hydrationHelper';
import PromptCard from '@/components/ui/PromptCard';
import { toast } from 'react-hot-toast';

export default function ContentPage() {
  // State for refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const [myPrompts, setMyPrompts] = useState([]);
  
  // Get prompts from the store
  const promptStore = usePromptStore();
  const currentUserId = 'current-user';
  
  // Force load prompts when component mounts
  useEffect(() => {
    console.log('Content page mounted, loading prompts');
    
    // Attempt to force reload store data
    try {
      const reloaded = forceReloadStore('prompt-storage');
      console.log('Store reload attempt:', reloaded ? 'successful' : 'failed');
    } catch (error) {
      console.error('Error reloading store:', error);
    }
    
    // Get prompts where this user is the creator
    const userPrompts = promptStore.prompts?.filter(
      prompt => prompt.creatorId === currentUserId || prompt.ownerId === currentUserId
    ) || [];
    
    setMyPrompts(userPrompts);
    console.log(`Found ${userPrompts.length} prompts created by user`);
  }, [promptStore, refreshKey]);
  
  // Add listener for storage events to catch updates
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage change detected, refreshing prompts');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Function to refresh data
  const refreshData = () => {
    forceReloadStore('prompt-storage');
    setRefreshKey(prev => prev + 1);
    toast.success('Content refreshed');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Content</h1>
        <div className="flex space-x-3">
          <button
            onClick={refreshData}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
          <Link
            href="/create"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New Prompt
          </Link>
        </div>
      </div>

      {myPrompts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mt-6">
          <p className="text-gray-500 mb-4">
            You don't have any prompts yet.
          </p>
          <Link 
            href="/create" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Prompt
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPrompts.map((prompt) => (
            <Link 
              key={prompt.id} 
              href={`/prompt/${prompt.id}`}
              className="block transition-transform hover:-translate-y-1 duration-200"
            >
              <PromptCard 
                prompt={prompt} 
                actionButtonText="View Details"
                actionButtonVariant="primary"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
