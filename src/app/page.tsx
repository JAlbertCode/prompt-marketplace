'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';
import PromptSearch from '@/components/ui/PromptSearch';
import { toast } from 'react-hot-toast';
import { Prompt, SonarModel } from '@/types';

export default function HomePage() {
  const promptStore = usePromptStore();
  const { prompts, resetStore } = promptStore;
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState<SonarModel | 'all'>('all');
  const [creditFilter, setCreditFilter] = useState({ min: 0, max: 1000 });
  
  // Filter prompts based on search and filters
  const filteredPrompts = useMemo(() => {
    if (!Array.isArray(prompts)) return [];
    
    return prompts.filter(prompt => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Model filter
      const matchesModel = modelFilter === 'all' || prompt.model === modelFilter;
      
      // Credit filter
      const matchesCredit = prompt.creditCost >= creditFilter.min && 
        prompt.creditCost <= creditFilter.max;
      
      return matchesSearch && matchesModel && matchesCredit;
    });
  }, [prompts, searchQuery, modelFilter, creditFilter]);
  
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
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sonar Prompt Marketplace
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and run optimized prompts powered by Perplexity Sonar
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={resetPromptStore}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Reset Prompts
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
      
      {Array.isArray(prompts) && prompts.length === 0 ? (
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
