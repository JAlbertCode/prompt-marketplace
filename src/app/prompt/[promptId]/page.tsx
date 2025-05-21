'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePromptStore } from '@/store/usePromptStore';
import Button from '@/components/shared/Button';
import CreditBadge from '@/components/ui/CreditBadge';
import { Prompt } from '@/types';
import { ArrowLeft, Play, Edit, Eye, RefreshCw } from 'lucide-react';
import ExampleModal from '@/components/ui/ExampleModal';
import { forceReloadStore } from '@/lib/hydrationHelper';

export default function PromptDetailPage({ params }: { params: { promptId: string } }) {
  const router = useRouter();
  const promptStore = usePromptStore();
  
  // Extract promptId in a way that's compatible with React 18's params promise
  const promptId = params?.promptId;
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [storeInitialized, setStoreInitialized] = useState(false);
  
  // Monitor store initialization
  useEffect(() => {
    // Check if store is already initialized
    try {
      const state = promptStore.getState();
      if (state && Array.isArray(state.prompts)) {
        setStoreInitialized(true);
      }
    } catch (error) {
      console.error('Error checking store initialization:', error);
    }
    
    // Set up a subscription to monitor store changes
    const unsubscribe = promptStore.subscribe((state) => {
      if (state && Array.isArray(state.prompts)) {
        setStoreInitialized(true);
      }
    });
    
    // Force a reload of the store to ensure it's populated
    // This helps with hydration issues in Next.js
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('prompt-storage');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData && parsedData.state && Array.isArray(parsedData.state.prompts)) {
            console.log('Found stored prompts, forcing initialization');
            setStoreInitialized(true);
          }
        }
      }
    } catch (err) {
      console.error('Error accessing localStorage:', err);
    }
    
    // Set a timeout as a fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!storeInitialized) {
        console.warn('Store initialization timeout reached, proceeding anyway');
        setStoreInitialized(true);
      }
    }, 3000);
    
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [promptStore, storeInitialized]);
  
  // Listen for storage update events
  useEffect(() => {
    // Handler for storage events
    const handleStorageUpdate = (event: StorageEvent | CustomEvent) => {
      console.log('Storage event detected:', event);
      
      // Check if this is our custom event
      if ((event as CustomEvent)?.detail?.store === 'prompt-storage') {
        console.log('Prompt store updated, refreshing prompt data');
        
        if (promptId) {
          const promptData = promptStore.getPrompt?.(promptId);
          if (promptData) {
            console.log('Found updated prompt in store:', promptData.title);
            setPrompt(promptData);
          }
        }
      } else if (event instanceof StorageEvent && event.key === 'prompt-storage') {
        // Native storage event
        console.log('Native storage event detected for prompt store');
        
        if (promptId) {
          // Force store reload to ensure we get the latest data
          setTimeout(() => {
            const promptData = promptStore.getPrompt?.(promptId);
            if (promptData) {
              console.log('Found updated prompt after storage event:', promptData.title);
              setPrompt(promptData);
            }
          }, 50); // Small delay to ensure store is updated
        }
      }
    };
    
    // Add event listeners for both custom and native events
    if (typeof window !== 'undefined') {
      window.addEventListener('storage-update', handleStorageUpdate as EventListener);
      window.addEventListener('storage', handleStorageUpdate as EventListener);
      
      // Attempt to force hydration on mount
      console.log('Forcing store reload on prompt page mount');
      forceReloadStore('prompt-storage');
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // Clean up event listeners
        window.removeEventListener('storage-update', handleStorageUpdate as EventListener);
        window.removeEventListener('storage', handleStorageUpdate as EventListener);
      }
    };
  }, [promptId, promptStore]);
  
  // Fetch the prompt data from store
  useEffect(() => {
    if (!storeInitialized) {
      console.log('Store not initialized yet, waiting before fetching prompt');
      return;
    }
    
    if (!promptId) {
      console.error('No promptId provided');
      setLoading(false);
      return;
    }
    
    console.log('Attempting to fetch prompt with ID:', promptId);
    
    try {
      const promptData = promptStore.getPrompt?.(promptId);
      
      if (promptData) {
        console.log('Successfully retrieved prompt:', promptData.title);
        setPrompt(promptData);
      } else {
        console.error('Prompt not found in store:', promptId);
        
        // Try to fetch from API as a backup
        fetch(`/api/prompts/${promptId}`)
          .then(response => {
            if (response.ok) return response.json();
            throw new Error('Failed to fetch prompt from API');
          })
          .then(data => {
            if (data && data.id) {
              console.log('Retrieved prompt from API:', data.title);
              setPrompt(data);
            } else {
              console.error('Invalid prompt data from API');
            }
          })
          .catch(err => {
            console.error('Error fetching prompt from API:', err);
          })
          .finally(() => {
            setLoading(false);
          });
        return; // Early return since we're handling loading state in the API fetch
      }
    } catch (error) {
      console.error('Error retrieving prompt:', error);
    }
    
    setLoading(false);
  }, [promptId, promptStore, storeInitialized]);
  
  const handleRunClick = () => {
    if (!prompt) return;
    router.push(`/run/${prompt.id}`);
  };
  
  const handleEditClick = () => {
    if (!prompt) return;
    router.push(`/prompt/${prompt.id}/edit`);
  };
  
  const handleBackClick = () => {
    router.push('/dashboard/content');
  };
  
  const handleRefresh = () => {
    setLoading(true);
    forceReloadStore('prompt-storage');
    
    // Try to fetch from API directly
    if (promptId) {
      fetch(`/api/prompts/${promptId}?_=${Date.now()}`)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Failed to refresh prompt data');
        })
        .then(data => {
          if (data && data.id) {
            console.log('Refreshed prompt data from API:', data.title);
            setPrompt(data);
          }
        })
        .catch(err => {
          console.error('Error refreshing prompt data:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-700">Loading prompt details...</p>
        <p className="text-sm text-gray-500 mt-2">
          If this takes too long, please <button onClick={() => window.location.reload()} className="text-blue-600 hover:underline">refresh the page</button>
        </p>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 my-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-3xl mx-auto mb-4">
            <span>?</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Prompt Not Found</h2>
          <p className="text-gray-600 mb-6">The prompt you're looking for either doesn't exist or couldn't be loaded properly.</p>
          <div className="space-y-3">
            <Button variant="primary" onClick={handleBackClick}>
              <ArrowLeft className="mr-2" />
              Return to Dashboard
            </Button>
            <div>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                Try refreshing the page
              </button>
            </div>
          </div>
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
          Back to My Content
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Refresh prompt data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <Button
            variant="outline"
            onClick={() => setShowExample(!!prompt.exampleOutput)}
            disabled={!prompt.exampleOutput}
          >
            <Eye className="mr-1" /> 
            View Example
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleEditClick}
          >
            <Edit className="mr-1" /> 
            Edit Prompt
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
            {prompt.systemPrompt || prompt.content ? (
              <>
                {(prompt.systemPrompt || prompt.content || '').substring(0, 150)}
                {(prompt.systemPrompt || prompt.content || '').length > 150 && '...'}
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