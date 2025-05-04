import React, { useState, useEffect } from 'react';
import { ModelInfo, getAllModels, getModelsByType } from '@/lib/models/modelRegistry';
import ModelCard from '@/components/shared/ModelCard';

type FilterOption = 'all' | 'text' | 'image' | 'audio';
type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc';

interface ModelGridProps {
  initialFilter?: FilterOption;
  showPricing?: boolean;
  onSelectModel?: (modelId: string) => void;
}

/**
 * Component for displaying a filterable, sortable grid of models
 * Can be used on models page and in model selection interfaces
 */
const ModelGrid: React.FC<ModelGridProps> = ({
  initialFilter = 'all',
  showPricing = true,
  onSelectModel
}) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [filter, setFilter] = useState<FilterOption>(initialFilter);
  const [sort, setSort] = useState<SortOption>('popular');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load and filter models
  useEffect(() => {
    let filteredModels = getAllModels().filter(model => model.available !== false);
    
    // Apply type filter
    if (filter !== 'all') {
      filteredModels = filteredModels.filter(model => 
        model.type === filter || model.capabilities.includes(filter)
      );
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filteredModels = filteredModels.filter(model => 
        model.displayName.toLowerCase().includes(term) || 
        model.description.toLowerCase().includes(term) ||
        model.provider.toLowerCase().includes(term) ||
        model.capabilities.some(cap => cap.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'popular':
        filteredModels.sort((a, b) => {
          // Popular models first
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          
          // Then by display name
          return a.displayName.localeCompare(b.displayName);
        });
        break;
      
      case 'price-asc':
        filteredModels.sort((a, b) => a.cost.medium - b.cost.medium);
        break;
      
      case 'price-desc':
        filteredModels.sort((a, b) => b.cost.medium - a.cost.medium);
        break;
      
      case 'name-asc':
        filteredModels.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      
      default:
        break;
    }
    
    setModels(filteredModels);
  }, [filter, sort, searchTerm]);
  
  // Group models by provider
  const modelsByProvider = models.reduce((groups, model) => {
    const provider = model.provider;
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(model);
    return groups;
  }, {} as Record<string, ModelInfo[]>);
  
  // Format provider name
  const formatProviderName = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'sonar':
        return 'Sonar AI';
      case 'anthropic':
        return 'Anthropic';
      case 'stability':
        return 'Stability AI';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search models..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            id="filter"
            value={filter}
            onChange={e => setFilter(e.target.value as FilterOption)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="text">Text Models</option>
            <option value="image">Image Models</option>
            <option value="audio">Audio Models</option>
          </select>
        </div>
        
        <div className="w-full md:w-1/3">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={sort}
            onChange={e => setSort(e.target.value as SortOption)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="popular">Popular First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>
      
      {models.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No models found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
            <div key={provider} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">
                {formatProviderName(provider)} Models
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerModels.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    showDetailedPricing={showPricing}
                    onClick={onSelectModel ? () => onSelectModel(model.id) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelGrid;