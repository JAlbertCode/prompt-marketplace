import { useState, useEffect } from 'react';
import { 
  getModelById, 
  getCostBreakdown, 
  PromptLength, 
  CostBreakdown 
} from '@/lib/models/modelRegistry';
import { useCreditStore } from '@/store/useCreditStore';

interface UseModelPricingOptions {
  modelId: string;
  promptLength?: PromptLength;
  creatorFeePercentage?: number;
  promptText?: string;
}

interface ModelPricingResult {
  cost: CostBreakdown;
  hasEnoughCredits: boolean;
  isLoading: boolean;
  error: string | null;
  estimatedPromptLength: PromptLength;
}

/**
 * Hook for easily accessing model pricing and credit availability
 */
export function useModelPricing({
  modelId,
  promptLength,
  creatorFeePercentage = 0,
  promptText
}: UseModelPricingOptions): ModelPricingResult {
  const { credits, isLoading: isLoadingCredits } = useCreditStore();
  const [cost, setCost] = useState<CostBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedPromptLength, setEstimatedPromptLength] = useState<PromptLength>(promptLength || 'medium');
  
  // Determine prompt length from text if provided
  useEffect(() => {
    if (promptText) {
      const length = promptText.length;
      
      if (length < 1500) {
        setEstimatedPromptLength('short');
      } else if (length < 6000) {
        setEstimatedPromptLength('medium');
      } else {
        setEstimatedPromptLength('long');
      }
    } else if (promptLength) {
      setEstimatedPromptLength(promptLength);
    }
  }, [promptText, promptLength]);
  
  // Calculate cost when inputs change
  useEffect(() => {
    try {
      // Make sure model exists
      const model = getModelById(modelId);
      
      if (!model) {
        setError(`Model ${modelId} not found`);
        return;
      }
      
      // Calculate cost breakdown
      const breakdown = getCostBreakdown(
        modelId, 
        estimatedPromptLength, 
        creatorFeePercentage
      );
      
      setCost(breakdown);
      setError(null);
    } catch (error) {
      console.error('Error calculating model cost:', error);
      setError(error instanceof Error ? error.message : 'Error calculating cost');
    }
  }, [modelId, estimatedPromptLength, creatorFeePercentage]);
  
  // Check if user has enough credits
  const hasEnoughCredits = !isLoadingCredits && cost ? credits >= cost.totalCost : false;
  
  return {
    cost: cost || {
      baseCost: 0,
      platformFee: 0,
      creatorFee: 0,
      totalCost: 0,
      dollarCost: '$0.000000'
    },
    hasEnoughCredits,
    isLoading: isLoadingCredits || !cost,
    error,
    estimatedPromptLength
  };
}