/**
 * Utility functions for calculating model costs
 * Based on actual provider pricing with conversion to our credit system
 * 1 credit = $0.000001, therefore $1 = 1,000,000 credits
 * All costs are stored as whole-number credits (no decimals)
 */

import { getModelById, ModelInfo, calculatePlatformMarkup } from './modelRegistry';

// API pricing constants in dollars (per 1K tokens)
const OPENAI_PRICING = {
  'gpt-4o': {
    input: 0.005, // $0.005 per 1K input tokens
    output: 0.015, // $0.015 per 1K output tokens
  },
  'gpt-4-turbo': {
    input: 0.01,
    output: 0.03,
  },
  'gpt-4o-mini': {
    input: 0.0015,
    output: 0.006,
  },
  'dall-e-3': {
    standard: 0.040, // $0.040 per image (1024x1024)
    hd: 0.080,      // $0.080 per HD image
  },
  'dall-e-2': {
    standard: 0.020, // $0.020 per image
  },
  'gpt-image-1': {
    standard: 0.050,  // $0.050 per image edit
  },
};

const ANTHROPIC_PRICING = {
  'claude-3-opus': {
    input: 0.015,
    output: 0.075,
  },
  'claude-3-sonnet': {
    input: 0.003,
    output: 0.015,
  },
};

const PERPLEXITY_PRICING = {
  'sonar-small-online': {
    input: 0.0008,
    output: 0.0016,
  },
  'sonar-medium-online': {
    input: 0.0016,
    output: 0.0032,
  },
  'sonar-large-online': {
    input: 0.0024,
    output: 0.0088,
  },
};

// Default assumptions for average token usage
const DEFAULT_ASSUMPTIONS = {
  textPrompt: {
    inputTokens: 500,  // Average input tokens for a text prompt
    outputTokens: 1000, // Average output tokens for a text prompt
  },
  imagePrompt: {
    quality: 'standard', // Default image quality
  },
};

/**
 * Calculate the actual API cost for a model based on average usage
 * @param modelId The ID of the model
 * @returns The estimated API cost in dollars
 */
export function calculateApiCost(modelId: string): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  // Handle text models
  if (model.type === 'text' || model.type === 'hybrid') {
    return calculateTextModelCost(model);
  }
  
  // Handle image models
  if (model.type === 'image') {
    return calculateImageModelCost(model);
  }

  return 0;
}

/**
 * Calculate text model cost based on token usage
 */
function calculateTextModelCost(model: ModelInfo): number {
  const { inputTokens, outputTokens } = DEFAULT_ASSUMPTIONS.textPrompt;
  let inputCost = 0;
  let outputCost = 0;

  // OpenAI models
  if (model.provider === 'openai') {
    const pricing = OPENAI_PRICING[model.id as keyof typeof OPENAI_PRICING];
    if (pricing && 'input' in pricing) {
      inputCost = (inputTokens / 1000) * pricing.input;
      outputCost = (outputTokens / 1000) * pricing.output;
    }
  }

  // Anthropic models
  else if (model.provider === 'anthropic') {
    const pricing = ANTHROPIC_PRICING[model.id as keyof typeof ANTHROPIC_PRICING];
    if (pricing) {
      inputCost = (inputTokens / 1000) * pricing.input;
      outputCost = (outputTokens / 1000) * pricing.output;
    }
  }

  // Perplexity models
  else if (model.provider === 'perplexity') {
    const pricing = PERPLEXITY_PRICING[model.id as keyof typeof PERPLEXITY_PRICING];
    if (pricing) {
      inputCost = (inputTokens / 1000) * pricing.input;
      outputCost = (outputTokens / 1000) * pricing.output;
    }
  }

  return inputCost + outputCost;
}

/**
 * Calculate image model cost
 */
function calculateImageModelCost(model: ModelInfo): number {
  const { quality } = DEFAULT_ASSUMPTIONS.imagePrompt;
  
  // OpenAI image models
  if (model.provider === 'openai') {
    const pricing = OPENAI_PRICING[model.id as keyof typeof OPENAI_PRICING];
    if (pricing && quality in pricing) {
      return pricing[quality as keyof typeof pricing];
    }
  }

  // Stability AI has fixed pricing per model
  if (model.provider === 'stability') {
    const modelPricing: Record<string, number> = {
      'stable-diffusion-xl': 0.040,
      'stability-xl-turbo': 0.030,
      'stability-xl-ultra': 0.060,
      'sdxl': 0.040,
      'sd3': 0.045,
    };
    
    return modelPricing[model.id] || 0.040;
  }

  return 0;
}

/**
 * Convert dollar cost to credits with whole-number rounding
 * @param apiCost The raw API cost in dollars
 * @returns The cost in whole-number credits (1 credit = $0.000001)
 */
export function convertApiCostToCredits(apiCost: number): number {
  // Convert to credits (1 credit = $0.000001)
  const credits = apiCost * 1_000_000;
  
  // Round to whole number credits
  return Math.ceil(credits);
}

/**
 * Calculate the recommended base cost for a model in credits
 * @param modelId The ID of the model
 * @returns The recommended base cost in whole-number credits
 */
export function calculateRecommendedBaseCost(modelId: string): number {
  const apiCost = calculateApiCost(modelId);
  return convertApiCostToCredits(apiCost);
}

/**
 * Calculate the total cost for running a prompt
 * @param modelId The model ID
 * @param creatorFee The creator fee in credits
 * @returns The total cost in whole-number credits
 */
export function calculateTotalPromptCost(modelId: string, creatorFee: number): number {
  const model = getModelById(modelId);
  if (!model) return 0;
  
  // Base cost is already in credits
  const inferenceCost = model.baseCost;
  
  // Platform markup only if no creator fee
  const platformMarkup = creatorFee > 0 ? 0 : calculatePlatformMarkup(inferenceCost);
  
  return inferenceCost + creatorFee + platformMarkup;
}

/**
 * Get the number of runs possible with a certain amount of dollars
 * @param modelId The model ID
 * @param creatorFee The creator fee
 * @param dollarAmount The dollar amount
 * @returns The number of runs possible (rounded down)
 */
export function getRunsPerDollar(modelId: string, creatorFee: number, dollarAmount: number): number {
  const totalCostPerRun = calculateTotalPromptCost(modelId, creatorFee);
  if (totalCostPerRun <= 0) return 0;
  
  // $1 = 1,000,000 credits
  const totalCredits = dollarAmount * 1_000_000;
  
  // Round down to get whole number of runs
  return Math.floor(totalCredits / totalCostPerRun);
}

/**
 * Get the dollar cost for a single run
 * @param modelId The model ID
 * @param creatorFee The creator fee
 * @returns The dollar cost per run
 */
export function getDollarCostPerRun(modelId: string, creatorFee: number): number {
  const totalCostInCredits = calculateTotalPromptCost(modelId, creatorFee);
  
  // Convert credits to dollars (1 credit = $0.000001)
  return totalCostInCredits * 0.000001;
}

/**
 * Generate user-friendly cost breakdown
 * @param modelId The model ID
 * @param creatorFee The creator fee
 * @returns Object with formatted cost breakdown
 */
export function getCostBreakdown(modelId: string, creatorFee: number): {
  inferenceCost: number;
  creatorFee: number;
  platformMarkup: number;
  totalCost: number;
  dollarCost: string;
  runsPerDollar: number;
} {
  const model = getModelById(modelId);
  
  // Base inference cost in credits (already whole numbers)
  const inferenceCost = model?.baseCost || 10000;
  
  // Platform markup only applied if no creator fee
  const platformMarkup = creatorFee > 0 ? 0 : calculatePlatformMarkup(inferenceCost);
  
  const totalCost = inferenceCost + creatorFee + platformMarkup;
  const dollarCost = (totalCost * 0.000001).toFixed(6);
  const runsPerDollar = getRunsPerDollar(modelId, creatorFee, 1);
  
  return {
    inferenceCost,
    creatorFee,
    platformMarkup,
    totalCost,
    dollarCost,
    runsPerDollar,
  };
}

/**
 * Utility function to format credit amount as dollar string
 * @param credits Number of credits
 * @returns Formatted dollar string
 */
export function formatCreditsToDollars(credits: number): string {
  const dollars = credits * 0.000001;
  
  if (dollars < 0.01) {
    // Scientific notation for very small amounts
    return `$${dollars.toExponential(6)}`;
  }
  
  return `$${dollars.toFixed(6)}`;
}

/**
 * Convert dollar amount to credits
 * @param dollars Dollar amount
 * @returns Number of whole-number credits
 */
export function convertDollarsToCredits(dollars: number): number {
  return Math.round(dollars * 1_000_000);
}