'use client';

import React, { useState } from 'react';
import { 
  getModelsByType, 
  getActiveModels, 
  ModelInfo, 
  ModelType, 
  getModelById 
} from '@/lib/models/modelRegistry';
import ModelCard from '@/components/marketplace/ModelCard';

interface EnhancedModelSelectorProps {
  currentModelId: string;
  onChange: (modelId: string) => void;
  filterType?: ModelType | 'all';
  showInactive?: boolean;
  className?: string;
}

const EnhancedModelSelector: React.FC<EnhancedModelSelectorProps> = ({
  currentModelId,
  onChange,
  filterType = 'all',
  showInactive = false,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ModelType | 'all'>(filterType);
  
  // Get current model for fallback
  const currentModel = getModelById(currentModelId);
  
  // Filter models
  let filteredModels: ModelInfo[] = showInactive 
    ? getActiveModels() 
    : getActiveModels().filter(model => model.status === 'active');
  
  // Filter by type if specified
  if (selectedType !== 'all') {
    filteredModels = filteredModels.filter(model => model.type === selectedType);
  }
  
  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredModels = filteredModels.filter(model => 
      model.displayName.toLowerCase().includes(term) ||
      model.description?.toLowerCase().includes(term) ||
      model.provider.toLowerCase().includes(term) ||
      model.capabilities.some(cap => cap.toLowerCase().includes(term))
    );
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ModelType | 'all');
  };
  
  const handleModelSelect = (modelId: string) => {
    onChange(modelId);
  };
  
  return (
    <div className={className}>
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
        >
          <option value="all">All Types</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      
      {filteredModels.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No models match your filters.</p>
          {currentModel && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Currently selected:</p>
              <ModelCard model={currentModel} selected />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={model.id === currentModelId}
              onClick={() => handleModelSelect(model.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedModelSelector;
