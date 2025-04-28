'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';
import PromptSearch from '@/components/ui/PromptSearch';
import Hero from '@/components/layout/Hero';
import { toast } from 'react-hot-toast';
import { Prompt, SonarModel } from '@/types';

export default function HomePage() {
  const promptStore = usePromptStore();
  const { getPublicPrompts, getUserPrompts, resetStore } = promptStore;
  
  // For the MVP, we'll use a mock current user ID
  const currentUserId = 'current-user';
  
  // Get available prompts (public + user's private prompts)
  const availablePrompts = useMemo(() => {
    // In a real app with authentication, we would get the user's ID
    // and filter prompts based on that
    return getUserPrompts?.(currentUserId) || [];
  }, [getUserPrompts, currentUserId]);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<SonarModel | 'all'>('all');
  const [creditFilter, setCreditFilter] = useState({ min: 0, max: 1000 });
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  
  // Filter prompts based on search and filters
  const filteredPrompts = useMemo(() => {
    if (!Array.isArray(availablePrompts)) return [];
    
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
  }, [availablePrompts, searchQuery, modelFilter, creditFilter, showPrivateOnly]);
  
  const resetPromptStore = () => {
    if (window.confirm('This will reset the prompt store to its initial state. Any custom prompts will be lost. Continue?')) {
      if (resetStore && typeof resetStore === 'function') {
        resetStore();
        toast.success('Prompt store reset successfully');
      } else {
        // Fallback if function is not available
        localStorage.removeItem('prompt-storage');
        window.location.reload();
        toast.success('Prompt store reset successfully');
      }
    }
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setModelFilter('all');
    setCreditFilter({ min: 0, max: 1000 });
    setShowPrivateOnly(false);
  };
  
  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8">
        <Hero />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Browse Prompts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Discover and run optimized prompts powered by Perplexity Sonar
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={resetPromptStore}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mr-2"
          >
            Reset Prompts
          </button>
          <button
            onClick={() => setShowPrivateOnly(!showPrivateOnly)}
            className={`px-3 py-1 text-xs mr-2 rounded-md ${showPrivateOnly ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-gray-100 text-gray-600 border border-gray-300'}`}
          >
            {showPrivateOnly ? 'Showing Private Only' : 'Show All Prompts'}
          </button>
          <Link href="/submit">
            <Button>
              Create Prompt
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <PromptSearch 
        onSearch={setSearchQuery}
        onModelFilter={setModelFilter}
        onCreditFilter={(min, max) => setCreditFilter({ min, max })}
      />
      
      {Array.isArray(availablePrompts) && availablePrompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No prompts available yet.
          </p>
          <Link href="/submit">
            <Button>
              Create Your First Prompt
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          {/* No results message */}
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No prompts match your filters</h3>
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
          {filteredPrompts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPrompts.map((prompt) => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
