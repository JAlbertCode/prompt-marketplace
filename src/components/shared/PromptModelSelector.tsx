import React, { useState, useEffect } from 'react';
import UnifiedModelSelector from '@/components/shared/UnifiedModelSelector';
import { useModelPricing } from '@/hooks/useModelPricing';
import { PromptLength } from '@/lib/models/modelRegistry';
import { useCreditStore } from '@/store/useCreditStore';

interface PromptModelSelectorProps {
  selectedModelId: string;
  onChange: (modelId: string) => void;
  promptText?: string;
  creatorFeePercentage?: number;
  disabled?: boolean;
}

/**
 * Model selector specifically for prompt creation/editing
 * Shows cost estimate based on prompt length
 */
const PromptModelSelector: React.FC<PromptModelSelectorProps> = ({
  selectedModelId,
  onChange,
  promptText = '',
  creatorFeePercentage = 0,
  disabled = false
}) => {
  const { fetchCredits } = useCreditStore();
  const [estimatedLength, setEstimatedLength] = useState<PromptLength>('medium');
  
  // Estimate prompt length based on text
  useEffect(() => {
    if (!promptText) {
      setEstimatedLength('medium');
      return;
    }
    
    const charCount = promptText.length;
    
    if (charCount < 1500) {
      setEstimatedLength('short');
    } else if (charCount < 6000) {
      setEstimatedLength('medium');
    } else {
      setEstimatedLength('long');
    }
  }, [promptText]);
  
  // Fetch credits on component mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  // Get pricing information based on the selected model and prompt length
  const { cost, hasEnoughCredits } = useModelPricing({
    modelId: selectedModelId,
    promptLength: estimatedLength,
    creatorFeePercentage
  });
  
  return (
    <div className="space-y-4">
      <UnifiedModelSelector
        selectedModelId={selectedModelId}
        onChange={onChange}
        promptLength={estimatedLength}
        creatorFeePercentage={creatorFeePercentage}
        modelType="text"
        disabled={disabled}
      />
      
      <div className="mt-2">
        <div className="text-sm text-gray-600 mb-1">
          Prompt length: <span className="font-medium capitalize">{estimatedLength}</span>
          {promptText && (
            <span className="ml-1">
              ({promptText.length.toLocaleString()} characters)
            </span>
          )}
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Estimated cost:</span>
            <span className="font-medium text-blue-700">
              {cost.totalCost.toLocaleString()} credits ({cost.dollarCost})
            </span>
          </div>
          
          {!hasEnoughCredits && (
            <div className="mt-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Insufficient credits. Please purchase more to run this prompt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptModelSelector;