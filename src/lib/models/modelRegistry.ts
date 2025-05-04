/**
 * Model Registry
 * 
 * This file serves as the central registry for all AI models available in the PromptFlow platform.
 * It defines model metadata, capabilities, pricing, and status.
 * 
 * All components should reference this registry to ensure consistent model information throughout the app.
 */

type ModelProvider = 'openai' | 'perplexity' | 'anthropic' | 'stability' | 'internal';
type ModelType = 'text' | 'image' | 'hybrid';
type ModelTier = 'high' | 'medium' | 'low';
type ModelStatus = 'active' | 'beta' | 'deprecated';
type PromptCategory = 'short' | 'standard' | 'long';

export interface ModelInfo {
  id: string;
  displayName: string;
  description: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: string[];
  maxTokens: number;
  baseCost: number; // Base cost in whole-number credits
  status: ModelStatus;
  tier?: ModelTier;
  promptCategoryCosts?: Record<PromptCategory, number>;
}

// Define all available models
// Base costs are in whole-number credits (1 credit = $0.000001)
const models: ModelInfo[] = [
  // OpenAI models
  {
    id: 'gpt-4',
    displayName: 'GPT-4',
    description: 'Advanced reasoning and language understanding model from OpenAI',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    baseCost: 30000, // $0.03 per 1000 tokens = 30,000 credits
    status: 'active',
  },
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'Optimized version of GPT-4 with improved performance',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    baseCost: 10000, // $0.01 per 1000 tokens = 10,000 credits
    status: 'active',
  },
  {
    id: 'dall-e-3',
    displayName: 'DALL-E 3',
    description: 'Advanced image generation model from OpenAI',
    provider: 'openai',
    type: 'image',
    capabilities: ['image'],
    maxTokens: 0,
    baseCost: 20000, // $0.02 per image = 20,000 credits
    status: 'active',
  },
  {
    id: 'gpt-image-1',
    displayName: 'GPT Image 1',
    description: 'Image editing and transformation model from OpenAI',
    provider: 'openai',
    type: 'image',
    capabilities: ['image'],
    maxTokens: 0,
    baseCost: 30000, // $0.03 per image edit = 30,000 credits
    status: 'active',
  },
  
  // Perplexity models
  {
    id: 'sonar-small-online',
    displayName: 'Sonar Small',
    description: 'Efficient model for everyday text tasks',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 200, // $0.0002 per 1000 tokens = 200 credits
    status: 'active',
    tier: 'high',
    promptCategoryCosts: {
      short: 200,
      standard: 300,
      long: 500
    }
  },
  {
    id: 'sonar-medium-online',
    displayName: 'Sonar Medium',
    description: 'Balanced model for more complex tasks',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 1900, // $0.0019 per 1000 tokens = 1,900 credits
    status: 'active',
    tier: 'medium',
    promptCategoryCosts: {
      short: 1900,
      standard: 3300,
      long: 5200
    }
  },
  {
    id: 'sonar-large-online',
    displayName: 'Sonar Large',
    description: 'Advanced model for sophisticated content generation',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 8500, // $0.0085 per 1000 tokens = 8,500 credits
    status: 'active',
    tier: 'low',
    promptCategoryCosts: {
      short: 17000,
      standard: 30000,
      long: 47000
    }
  },
  {
    id: 'sonar-pro-small-online',
    displayName: 'Sonar Pro Small',
    description: 'Enhanced efficiency for everyday tasks',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 200, // $0.0002 per 1000 tokens = 200 credits
    status: 'active',
    tier: 'high',
    promptCategoryCosts: {
      short: 200,
      standard: 300,
      long: 500
    }
  },
  {
    id: 'sonar-pro-medium-online',
    displayName: 'Sonar Pro Medium',
    description: 'Enhanced model for complex tasks',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 700, // $0.0007 per 1000 tokens = 700 credits
    status: 'active',
    tier: 'medium',
    promptCategoryCosts: {
      short: 700,
      standard: 1200,
      long: 1900
    }
  },
  {
    id: 'sonar-pro-large-online',
    displayName: 'Sonar Pro Large',
    description: 'Enhanced model for sophisticated content',
    provider: 'perplexity',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    baseCost: 3400, // $0.0034 per 1000 tokens = 3,400 credits
    status: 'active',
    tier: 'low',
    promptCategoryCosts: {
      short: 3400,
      standard: 6000,
      long: 9400
    }
  },
  
  // Anthropic models
  {
    id: 'claude-3-opus',
    displayName: 'Claude 3 Opus',
    description: 'Anthropic\'s most intelligent model',
    provider: 'anthropic',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 200000,
    baseCost: 15000, // $0.015 per 1000 tokens = 15,000 credits
    status: 'active',
  },
  {
    id: 'claude-3-sonnet',
    displayName: 'Claude 3 Sonnet',
    description: 'Balanced Anthropic model for everyday tasks',
    provider: 'anthropic',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 200000,
    baseCost: 3000, // $0.003 per 1000 tokens = 3,000 credits
    status: 'active',
  },
  {
    id: 'claude-3-haiku',
    displayName: 'Claude 3 Haiku',
    description: 'Fast and efficient Anthropic model',
    provider: 'anthropic',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 200000,
    baseCost: 250, // $0.00025 per 1000 tokens = 250 credits
    status: 'active',
  },
  
  // Stability AI models
  {
    id: 'stable-diffusion-xl',
    displayName: 'Stable Diffusion XL',
    description: 'High quality image generation from Stability AI',
    provider: 'stability',
    type: 'image',
    capabilities: ['image'],
    maxTokens: 0,
    baseCost: 2000, // $0.002 per image = 2,000 credits
    status: 'active',
  },
];

/**
 * Get a model by its ID
 */
export function getModelById(id: string): ModelInfo | undefined {
  return models.find(model => model.id === id);
}

/**
 * Get all models
 */
export function getAllModels(): ModelInfo[] {
  return models;
}

/**
 * Get models by capability
 */
export function getModelsByCapability(capability: string): ModelInfo[] {
  return models.filter(model => model.capabilities.includes(capability));
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: ModelProvider): ModelInfo[] {
  return models.filter(model => model.provider === provider);
}

/**
 * Get models by type
 */
export function getModelsByType(type: ModelType): ModelInfo[] {
  return models.filter(model => model.type === type);
}

/**
 * Get active models
 */
export function getActiveModels(): ModelInfo[] {
  return models.filter(model => model.status === 'active');
}

/**
 * Calculate platform markup based on inference cost
 * @param inferenceCost Base inference cost in credits
 * @returns Platform markup in credits
 */
export function calculatePlatformMarkup(inferenceCost: number): number {
  if (inferenceCost < 10_000) {
    // < $0.01
    return Math.floor(inferenceCost * 0.20);
  } else if (inferenceCost < 100_000) {
    // < $0.10
    return Math.floor(inferenceCost * 0.10);
  } else {
    // Flat fee for expensive operations
    return 500; // $0.0005 = 500 credits
  }
}

/**
 * Interface for cost breakdown
 */
interface CostBreakdown {
  inferenceCost: number;  // Base cost for the model inference
  platformMarkup: number;    // Platform's markup
  creatorFee: number;     // Creator's fee (if applicable)
  totalCost: number;      // Total cost in credits
  dollarCost: string;     // Dollar representation (formatted)
}

/**
 * Calculate cost breakdown for a model and additional fees
 */
export function getCostBreakdown(modelId: string, creatorFee: number = 0): CostBreakdown {
  const model = getModelById(modelId);
  
  if (!model) {
    // Default to a minimum cost if model not found
    return {
      inferenceCost: 10000,
      platformMarkup: 2000,
      creatorFee: creatorFee,
      totalCost: 12000 + creatorFee,
      dollarCost: `$${((12000 + creatorFee) * 0.000001).toFixed(6)}`
    };
  }
  
  // Get base inference cost (already in credits)
  const inferenceCost = model.baseCost;
  
  // Calculate platform markup (only if no creator fee)
  const platformMarkup = creatorFee > 0 ? 0 : calculatePlatformMarkup(inferenceCost);
  
  // Calculate total cost
  const totalCost = inferenceCost + platformMarkup + creatorFee;
  
  // Format dollar cost (1 credit = $0.000001)
  const dollarCost = `$${(totalCost * 0.000001).toFixed(6)}`;
  
  return {
    inferenceCost,
    platformMarkup,
    creatorFee,
    totalCost,
    dollarCost
  };
}

/**
 * Calculate credit cost for a prompt run
 */
export function calculatePromptCreditCost(modelId: string, creatorFee: number = 0): number {
  const breakdown = getCostBreakdown(modelId, creatorFee);
  return breakdown.totalCost;
}

/**
 * Calculate total credit cost for a flow run
 */
export function calculateFlowCreditCost(modelIds: string[], creatorFees: number[] = []): number {
  let totalCost = 0;
  
  modelIds.forEach((modelId, index) => {
    const creatorFee = creatorFees[index] || 0;
    const breakdown = getCostBreakdown(modelId, creatorFee);
    totalCost += breakdown.totalCost;
  });
  
  return totalCost;
}