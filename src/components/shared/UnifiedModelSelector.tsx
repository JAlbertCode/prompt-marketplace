import React, { useState, useEffect } from 'react';
import { 
  getActiveModels, 
  getModelById, 
  getModelsByType,
  ModelInfo,
  PromptLength,
  getCostBreakdown
} from '@/lib/models/modelRegistry';
import { useCreditStore } from '@/store/useCreditStore';
import ModelCard from '@/components/shared/ModelCard';

interface ModelSelectorProps {
  selectedModelId: string;
  onChange: (modelId: string) => void;
  promptLength?: PromptLength;
  creatorFeePercentage?: number;
  modelType?: 'text' | 'image' | 'audio' | 'hybrid';
  disabled?: boolean;
  compact?: boolean;
}

/**
 * A unified model selector component that can be used across the application
 * Works with PromptForm, FlowEditor, and anywhere else model selection is needed
 */
const UnifiedModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onChange,
  promptLength = 'medium',
  creatorFeePercentage = 0,
  modelType,
  disabled = false,
  compact = false
}) => {
  const { credits, fetchCredits } = useCreditStore();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch updated credit balance
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  // Filter models based on type and availability
  useEffect(() => {
    let availableModels = getActiveModels();
    
    // Filter by type if specified
    if (modelType) {
      availableModels = availableModels.filter(
        model => model.type === modelType || model.capabilities.includes(modelType)
      );
    }
    
    // Sort by popular first, then by price
    availableModels.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!b.isPopular && a.isPopular) return 1;
      return a.cost[promptLength] - b.cost[promptLength];
    });
    
    setModels(availableModels);
    
    // If selected model isn't in the available models, select the first one
    if (selectedModelId && !availableModels.some(m => m.id === selectedModelId) && availableModels.length > 0) {
      onChange(availableModels[0].id);
    }
  }, [modelType, promptLength, selectedModelId, onChange]);
  
  // Filter models by search term
  const filteredModels = searchTerm.trim() === '' 
    ? models 
    : models.filter(model => {
        const term = searchTerm.toLowerCase();
        return model.displayName.toLowerCase().includes(term) || 
          model.description.toLowerCase().includes(term) ||
          model.provider.toLowerCase().includes(term);
      });
  
  // Get the selected model
  const selectedModel = getModelById(selectedModelId);
  
  // Check if user has enough credits
  const hasEnoughCredits = (modelId: string): boolean => {
    try {
      const { totalCost } = getCostBreakdown(modelId, promptLength, creatorFeePercentage);
      return credits >= totalCost;
    } catch (error) {
      return false;
    }
  };
  
  // Format credit amount
  const formatCredits = (amount: number): string => {
    return amount.toLocaleString();
  };
  
  // Compact view for tight UI spaces
  if (compact) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Model
        </label>
        
        <select
          value={selectedModelId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-60"
        >
          {models.map(model => {
            const cost = model.cost[promptLength];
            const hasCredits = hasEnoughCredits(model.id);
            
            return (
              <option 
                key={model.id} 
                value={model.id}
                disabled={!hasCredits || disabled}
              >
                {model.displayName} ({formatCredits(cost)} credits)
              </option>
            );
          })}
        </select>
        
        {selectedModel && (
          <div className="text-sm text-gray-600">
            {selectedModel.description}
          </div>
        )}
        
        {selectedModel && !hasEnoughCredits(selectedModel.id) && (
          <div className="text-sm text-red-600">
            You don't have enough credits to use this model.
          </div>
        )}
      </div>
    );
  }
  
  // Full selection UI with model cards
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Select Model
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show All Models'}
          </button>
          
          {isExpanded && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search models..."
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          )}
        </div>
      </div>
      
      {/* Selected model */}
      {selectedModel && !isExpanded && (
        <ModelCard
          model={selectedModel}
          isSelected
          promptLength={promptLength}
        />
      )}
      
      {/* Popular models when not expanded */}
      {!isExpanded && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Popular Models
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {models
              .filter(model => model.isPopular && model.id !== selectedModelId)
              .slice(0, 3)
              .map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onClick={() => {
                    if (!disabled && hasEnoughCredits(model.id)) {
                      onChange(model.id);
                    }
                  }}
                  promptLength={promptLength}
                  className={`${
                    !hasEnoughCredits(model.id) || disabled
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                />
              ))}
          </div>
        </div>
      )}
      
      {/* All models when expanded */}
      {isExpanded && (
        <div className="space-y-4">
          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onClick={() => {
                    if (!disabled && hasEnoughCredits(model.id)) {
                      onChange(model.id);
                      setIsExpanded(false);
                    }
                  }}
                  isSelected={model.id === selectedModelId}
                  promptLength={promptLength}
                  className={`${
                    !hasEnoughCredits(model.id) || disabled
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No models match your search.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Credit status */}
      <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
        <div>
          Your balance: <span className="font-medium">{formatCredits(credits)} credits</span>
        </div>
        
        {selectedModel && (
          <div>
            Run cost: <span className="font-medium">{formatCredits(selectedModel.cost[promptLength])} credits</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedModelSelector;