'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';
import PromptCard from '@/components/ui/PromptCard';
import FlowCard from '@/components/marketplace/MarketplaceCard';
import Button from '@/components/shared/Button';
import MarketplaceSearch from '@/components/marketplace/FilterBar';
import Hero from '@/components/layout/Hero';
import { toast } from 'react-hot-toast';
import { Prompt, PromptFlow, SonarModel, ItemType } from '@/types';

// This is the original home page content, now moved to a separate component
export default function HomePage() {
  const promptStore = usePromptStore();
  const flowStore = useFlowStore();
  const unlockedFlowStore = useUnlockedFlowStore();
  
  // For the MVP, we'll use a mock current user ID
  const currentUserId = 'current-user';
  
  // Get available prompts and flows
  const availablePrompts = useMemo(() => {
    return promptStore.getUserPrompts?.(currentUserId) || [];
  }, [promptStore, currentUserId]);
  
  const availableFlows = useMemo(() => {
    return flowStore.getUserFlows?.(currentUserId) || [];
  }, [flowStore, currentUserId]);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<SonarModel | 'all'>('all');
  const [creditFilter, setCreditFilter] = useState({ min: 0, max: 1000 });
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | 'all'>('all');
  const [showDrafts, setShowDrafts] = useState(false);
  
  // Filter prompts based on search and filters
  const filteredPrompts = useMemo(() => {
    if (!Array.isArray(availablePrompts)) return [];
    if (itemTypeFilter === 'flow') return []; // Don't show prompts if filtering for flows only
    
    return availablePrompts.filter(prompt => {
      // Private filter
      const matchesPrivacy = !showPrivateOnly || prompt.isPrivate;
      
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Model filter
      const matchesModel = modelFilter === 'all' || prompt.model === modelFilter;
      
      // Credit filter
      const matchesCredit = prompt.creditCost >= creditFilter.min && 
        prompt.creditCost <= creditFilter.max;
      
      return matchesPrivacy && matchesSearch && matchesModel && matchesCredit;
    });
  }, [availablePrompts, searchQuery, modelFilter, creditFilter, showPrivateOnly, itemTypeFilter]);
  
  // Filter flows based on search and filters
  const filteredFlows = useMemo(() => {
    if (!Array.isArray(availableFlows)) return [];
    if (itemTypeFilter === 'prompt') return []; // Don't show flows if filtering for prompts only
    
    return availableFlows.filter(flow => {
      // Private filter
      const matchesPrivacy = !showPrivateOnly || flow.isPrivate;
      
      // Draft filter
      const matchesDraftStatus = showDrafts || !flow.isDraft;
      
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        flow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flow.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Credit filter (based on total flow cost)
      const matchesCredit = flow.totalCreditCost >= creditFilter.min && 
        flow.totalCreditCost <= creditFilter.max;
      
      return matchesPrivacy && matchesDraftStatus && matchesSearch && matchesCredit;
    });
  }, [availableFlows, searchQuery, creditFilter, showPrivateOnly, showDrafts, itemTypeFilter]);
  
  const resetPromptStore = () => {
    if (window.confirm('This will reset both the prompt and flow stores to their initial state. Any custom prompts and flows will be lost. Continue?')) {
      promptStore.resetStore?.();
      flowStore.resetStore?.();
      unlockedFlowStore.resetStore?.();
      toast.success('Stores reset successfully');
    }
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setModelFilter('all');
    setCreditFilter({ min: 0, max: 1000 });
    setShowPrivateOnly(false);
    setItemTypeFilter('all');
    setShowDrafts(false);
  };
  
  // Combine filtered prompts and flows for display
  const allFilteredItems = [...filteredPrompts, ...filteredFlows];
  
  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8">
        <Hero />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Browse Marketplace
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Discover and use optimized prompts and flows powered by Perplexity Sonar
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={resetPromptStore}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mr-2"
          >
            Reset Stores
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPrivateOnly(!showPrivateOnly)}
              className={`px-3 py-1 text-xs rounded-md ${showPrivateOnly ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}
            >
              {showPrivateOnly ? 'Private Only' : 'All Items'}
            </button>
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`px-3 py-1 text-xs rounded-md ${showDrafts ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}
            >
              {showDrafts ? 'Show Drafts' : 'Hide Drafts'}
            </button>
          </div>
          <Link href="/create">
            <Button>
              Create New
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Item type filter */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setItemTypeFilter('all')}
            className={`px-4 py-2 rounded-md ${itemTypeFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Items
          </button>
          <button
            onClick={() => setItemTypeFilter('prompt')}
            className={`px-4 py-2 rounded-md ${itemTypeFilter === 'prompt' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Single Prompts
          </button>
          <button
            onClick={() => setItemTypeFilter('flow')}
            className={`px-4 py-2 rounded-md ${itemTypeFilter === 'flow' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Prompt Flows
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <MarketplaceSearch 
        onSearch={setSearchQuery}
        onModelFilter={setModelFilter}
        onCreditFilter={(min, max) => setCreditFilter({ min, max })}
      />
      
      {allFilteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No items available yet.
          </p>
          <Link href="/create">
            <Button>
              Create Your First Item
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          {/* No results message */}
          {allFilteredItems.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No items match your filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters to see more results.</p>
              <button 
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {/* Results grid */}
          {allFilteredItems.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                  key={`prompt-${prompt.id}`} 
                  prompt={prompt} 
                />
              ))}
              
              {filteredFlows.map((flow) => (
                <FlowCard 
                  key={`flow-${flow.id}`} 
                  item={{
                    id: flow.id,
                    title: flow.title,
                    description: flow.description,
                    creditCost: flow.totalCreditCost,
                    type: 'flow',
                    isLocked: flow.unlockPrice > 0 && !unlockedFlowStore.isFlowUnlocked(flow.id),
                    unlockPrice: flow.unlockPrice,
                    isDraft: flow.isDraft,
                    createdAt: flow.createdAt,
                    ownerId: flow.ownerId,
                    steps: flow.steps,
                    totalCreditCost: flow.totalCreditCost
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}