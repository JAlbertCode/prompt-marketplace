import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getAllModels, 
  getModelsByType, 
  getCostBreakdown,
  PromptLength
} from '@/lib/models/modelRegistry';
import { useCreditStore } from '@/store/useCreditStore';

interface ModelSelectorProps {
  selectedModelId: string;
  onChange: (modelId: string) => void;
  promptLength?: PromptLength;
  creatorFeePercentage?: number;
  showPricing?: boolean;
  inputType?: 'text' | 'image' | 'audio';
  outputType?: 'text' | 'image' | 'audio';
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onChange,
  promptLength = 'medium',
  creatorFeePercentage = 0,
  showPricing = true,
  inputType = 'text',
  outputType = 'text'
}) => {
  const { data: session } = useSession();
  const { credits } = useCreditStore();
  const [models, setModels] = useState(getAllModels());
  
  // Filter models based on input/output types
  useEffect(() => {
    let filteredModels = getAllModels();
    
    if (inputType || outputType) {
      filteredModels = filteredModels.filter(model => {
        if (inputType && model.type !== inputType && model.capabilities.includes(inputType) === false) {
          return false;
        }
        
        if (outputType && model.type !== outputType && model.capabilities.includes(outputType) === false) {
          return false;
        }
        
        return model.available !== false;
      });
    }
    
    setModels(filteredModels);
    
    // If selected model is not in the filtered list, select the first one
    if (filteredModels.length > 0 && !filteredModels.some(model => model.id === selectedModelId)) {
      onChange(filteredModels[0].id);
    }
  }, [inputType, outputType, selectedModelId, onChange]);
  
  const getModelCost = (modelId: string) => {
    try {
      const { totalCost } = getCostBreakdown(modelId, promptLength, creatorFeePercentage);
      return totalCost;
    } catch (error) {
      return 0;
    }
  };
  
  const hasEnoughCredits = (modelId: string) => {
    const cost = getModelCost(modelId);
    return credits >= cost;
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <div className="mb-4">
      <label htmlFor="model-selector" className="block text-sm font-medium text-gray-700 mb-1">
        Model
      </label>
      
      <div className="relative">
        <select
          id="model-selector"
          value={selectedModelId}
          onChange={handleModelChange}
          className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
        >
          {models.map(model => (
            <option 
              key={model.id} 
              value={model.id}
              disabled={!hasEnoughCredits(model.id)}
            >
              {model.displayName}
              {showPricing && ` (${getModelCost(model.id).toLocaleString()} credits)`}
            </option>
          ))}
        </select>
        
        {showPricing && (
          <div className="mt-2 text-sm text-gray-600 flex items-center">
            <span className="text-blue-600 mr-1">💎</span>
            <span>
              Cost: {getModelCost(selectedModelId).toLocaleString()} credits
              {creatorFeePercentage > 0 && ` (includes ${creatorFeePercentage}% creator fee)`}
            </span>
          </div>
        )}
        
        {!hasEnoughCredits(selectedModelId) && (
          <div className="mt-1 text-sm text-red-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Not enough credits. You need {getModelCost(selectedModelId).toLocaleString()} credits.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;