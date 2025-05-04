/**
 * Model Registry
 * 
 * This file serves as the central registry for all AI models available in the PromptFlow platform.
 * It defines model metadata, capabilities, pricing, and status.
 * 
 * All components should reference this registry to ensure consistent model information throughout the app.
 * 
 * Credit costs are based on the accurate pricing data.
 * 1 credit = $0.000001
 * $1 = 1,000,000 credits
 */

type ModelProvider = 'openai' | 'sonar' | 'anthropic' | 'stability' | 'internal';
type ModelType = 'text' | 'image' | 'audio' | 'hybrid';
type ModelTier = 'high' | 'medium' | 'low';
type ModelStatus = 'active' | 'beta' | 'deprecated';
export type PromptLength = 'short' | 'medium' | 'long';

export interface ModelInfo {
  id: string;
  displayName: string;
  description: string;
  provider: ModelProvider;
  type: ModelType;
  capabilities: string[];
  maxTokens?: number;
  status: ModelStatus;
  tier?: ModelTier;
  cost: {
    short: number;  // Credits for short prompts
    medium: number; // Credits for medium prompts
    long: number;   // Credits for long prompts
  };
  available?: boolean;
  isPopular?: boolean;
}

// Define all available models
// Costs are in credits (1 credit = $0.000001)
// Only including models we actually support via API based on the PDF pricing
const models: ModelInfo[] = [
  // OpenAI GPT-4o models
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    description: 'Latest GPT-4o model with excellent reasoning capabilities',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    status: 'active',
    cost: {
      short: 8500,   // $0.0085 per request
      medium: 15000, // $0.0150 per request
      long: 23500,   // $0.0235 per request
    },
    available: true,
    isPopular: true,
  },
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    description: 'Fast and cost-effective version of GPT-4o',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    status: 'active',
    cost: {
      short: 1000,   // $0.0010 per request
      medium: 1800,  // $0.0018 per request
      long: 2800,    // $0.0028 per request
    },
    available: true,
    isPopular: true,
  },
  {
    id: 'gpt-4o-audio',
    displayName: 'GPT-4o Audio',
    description: 'Process audio input with GPT-4o',
    provider: 'openai',
    type: 'audio',
    capabilities: ['text', 'audio'],
    status: 'active',
    cost: {
      short: 44000,  // $0.0440 per request
      medium: 80000, // $0.0800 per request
      long: 124000,  // $0.1240 per request
    },
    available: true,
  },
  
  // GPT-4.1 Series
  {
    id: 'gpt-4.1',
    displayName: 'GPT-4.1',
    description: 'Latest GPT-4.1 model with excellent reasoning capabilities',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    status: 'active',
    cost: {
      short: 3400,   // $0.0034 per request
      medium: 6000,  // $0.0060 per request
      long: 9400,    // $0.0094 per request
    },
    available: true,
  },
  {
    id: 'gpt-4.1-mini',
    displayName: 'GPT-4.1 Mini',
    description: 'Smaller and faster version of GPT-4.1',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 8192,
    status: 'active',
    cost: {
      short: 700,    // $0.0007 per request
      medium: 1200,  // $0.0012 per request
      long: 1900,    // $0.0019 per request
    },
    available: true,
  },
  {
    id: 'gpt-4.1-nano',
    displayName: 'GPT-4.1 Nano',
    description: 'Ultra-efficient version of GPT-4.1',
    provider: 'openai',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    status: 'active',
    cost: {
      short: 200,    // $0.0002 per request
      medium: 300,   // $0.0003 per request
      long: 500,     // $0.0005 per request
    },
    available: true,
  },
  
  // OpenAI Image Models
  {
    id: 'gpt-image-1-text',
    displayName: 'GPT Image 1 (Text)',
    description: 'Generate images from text prompts',
    provider: 'openai',
    type: 'image',
    capabilities: ['image'],
    status: 'active',
    cost: {
      short: 5000,   // $0.0050 per image
      medium: 5000,  // Same cost regardless of prompt length
      long: 5000,    // Same cost regardless of prompt length
    },
    available: false, // Hidden temporarily
  },
  {
    id: 'gpt-image-1-image',
    displayName: 'GPT Image 1 (Image)',
    description: 'Edit or enhance existing images',
    provider: 'openai',
    type: 'image',
    capabilities: ['image'],
    status: 'active',
    cost: {
      short: 17000,  // $0.0170 per request
      medium: 30000, // $0.0300 per request
      long: 47000,   // $0.0470 per request
    },
    available: false, // Hidden temporarily
  },
  {
    id: 'dall-e-3',
    displayName: 'DALL-E 3',
    description: 'Generate detailed images from text descriptions',
    provider: 'openai',
    type: 'image',
    capabilities: ['image'],
    status: 'active',
    cost: {
      short: 20000,  // $0.0200 per image
      medium: 20000, // Same cost regardless of prompt length
      long: 20000,   // Same cost regardless of prompt length
    },
    available: true, // Hidden temporarily
    isPopular: true,
  },
  
  // Sonar Models
  {
    id: 'sonar-pro-medium',
    displayName: 'Sonar Pro Medium',
    description: 'High performance model from Sonar with balanced resource usage',
    provider: 'sonar',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    status: 'active',
    cost: {
      short: 700,   // $0.0007 per request
      medium: 1200, // $0.0012 per request
      long: 1900,   // $0.0019 per request
    },
    available: true,
  },
  {
    id: 'sonar-pro-high',
    displayName: 'Sonar Pro High',
    description: 'Premium AI model from Sonar with advanced reasoning',
    provider: 'sonar',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    status: 'active',
    cost: {
      short: 200,   // $0.0002 per request
      medium: 300,  // $0.0003 per request
      long: 500,    // $0.0005 per request
    },
    available: true,
  },
  {
    id: 'sonar-reasoning-low',
    displayName: 'Sonar Reasoning',
    description: 'Specialized AI model for complex reasoning tasks',
    provider: 'sonar',
    type: 'text',
    capabilities: ['text'],
    maxTokens: 4096,
    status: 'active',
    cost: {
      short: 17000,  // $0.0170 per request
      medium: 30000, // $0.0300 per request
      long: 47000,   // $0.0470 per request
    },
    available: true,
  },
  {
    id: 'sonar-deep-research',
    displayName: 'Sonar Deep Research',
    description: 'Comprehensive research model with web search capabilities',
    provider: 'sonar',
    type: 'text',
    capabilities: ['text', 'search'],
    maxTokens: 8192,
    status: 'active',
    cost: {
      short: 2000,   // $0.0020 per request
      medium: 8000,  // $0.0080 per request
      long: 5000,    // $0.0050 per request
    },
    available: true,
  }
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
  return models.filter(model => model.status === 'active' && model.available !== false);
}

/**
 * Calculate platform fee (10% of model cost when there is no creator fee)
 * @param modelCost Base model cost in credits
 */
export function calculatePlatformFee(modelCost: number, hasCreatorFee: boolean = false): number {
  // If there's a creator fee, platform gets 20% of that instead
  if (hasCreatorFee) {
    return 0;
  }
  
  return Math.floor(modelCost * 0.10); // 10% platform fee
}

/**
 * Interface for cost breakdown
 */
export interface CostBreakdown {
  baseCost: number;     // Base cost for the model (from cost table)
  platformFee: number;  // Platform's fee
  creatorFee: number;   // Creator's fee (if applicable)
  totalCost: number;    // Total cost in credits
  dollarCost: string;   // Dollar representation (formatted)
}

/**
 * Calculate cost breakdown for a model and prompt length
 */
export function getCostBreakdown(
  modelId: string, 
  promptLength: PromptLength = 'medium',
  creatorFeePercentage: number = 0
): CostBreakdown {
  const model = getModelById(modelId);
  
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  // Get base cost based on prompt length
  const baseCost = model.cost[promptLength];
  
  // Calculate creator fee if applicable
  const creatorFee = creatorFeePercentage > 0 
    ? Math.floor(baseCost * (creatorFeePercentage / 100)) 
    : 0;
  
  // Calculate platform fee (0 if there's a creator fee since platform gets 20% of that)
  const platformFee = calculatePlatformFee(baseCost, creatorFee > 0);
  
  // Calculate total cost
  const totalCost = baseCost + platformFee + creatorFee;
  
  // Format dollar cost (1 credit = $0.000001)
  const dollarCost = `$${(totalCost * 0.000001).toFixed(6)}`;
  
  return {
    baseCost,
    platformFee,
    creatorFee,
    totalCost,
    dollarCost
  };
}

/**
 * Estimate prompt length based on text content
 */
export function estimatePromptLength(text: string): PromptLength {
  const charCount = text.length;
  
  if (charCount < 1500) {
    return 'short';
  } else if (charCount < 6000) {
    return 'medium';
  } else {
    return 'long';
  }
}

/**
 * Calculate credit cost for a prompt run
 */
export function calculatePromptCreditCost(
  modelId: string, 
  promptLength: PromptLength = 'medium',
  creatorFeePercentage: number = 0
): number {
  const breakdown = getCostBreakdown(modelId, promptLength, creatorFeePercentage);
  return breakdown.totalCost;
}

/**
 * Calculate total credit cost for a flow run
 */
export function calculateFlowCreditCost(
  steps: Array<{modelId: string, promptLength: PromptLength, creatorFeePercentage?: number}>
): number {
  let totalCost = 0;
  
  steps.forEach(step => {
    const { modelId, promptLength, creatorFeePercentage = 0 } = step;
    const breakdown = getCostBreakdown(modelId, promptLength, creatorFeePercentage);
    totalCost += breakdown.totalCost;
  });
  
  return totalCost;
}