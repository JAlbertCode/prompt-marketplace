'use client';

import React, { useState } from 'react';
import { 
  getActiveModels, 
  getModelsByType, 
  getModelsByProvider, 
  ModelType, 
  ModelProvider 
} from '@/lib/models/modelRegistry';
import ModelCard from '@/components/marketplace/ModelCard';

export default function ModelsPage() {
  const [filterType, setFilterType] = useState<ModelType | 'all'>('all');
  const [filterProvider, setFilterProvider] = useState<ModelProvider | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get models based on filters
  let filteredModels = showInactive 
    ? [...getActiveModels(), ...getModelsByType('text').filter(m => m.status !== 'active'), ...getModelsByType('image').filter(m => m.status !== 'active')]
    : getActiveModels();
  
  // Filter by type
  if (filterType !== 'all') {
    filteredModels = filteredModels.filter(model => model.type === filterType);
  }
  
  // Filter by provider
  if (filterProvider !== 'all') {
    filteredModels = filteredModels.filter(model => model.provider === filterProvider);
  }
  
  // Search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredModels = filteredModels.filter(model => 
      model.displayName.toLowerCase().includes(term) || 
      model.description?.toLowerCase().includes(term) ||
      model.provider.toLowerCase().includes(term) ||
      model.capabilities.some(cap => cap.toLowerCase().includes(term))
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Models</h1>
        <p className="text-gray-600">
          Browse all available AI models on the PromptFlow platform.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ModelType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          
          {/* Provider Filter */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              id="provider"
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value as ModelProvider | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="perplexity">Perplexity</option>
              <option value="anthropic">Anthropic</option>
              <option value="stability">Stability AI</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show inactive models</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">
            {filteredModels.length} {filteredModels.length === 1 ? 'Model' : 'Models'}
          </h2>
        </div>
        
        {filteredModels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No models match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                showDetails={true}
                selected={false}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Credits */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>
          All models are provided by their respective companies. 
          PromptFlow charges credits based on actual API usage plus a small service fee.
        </p>
        <p className="mt-1">
          1,000 credits = $1.00
        </p>
      </div>
    </div>
  );
}
