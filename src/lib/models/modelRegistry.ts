/**
 * Central registry for all AI models available in the marketplace
 */

import { calculateSonarInferenceCost, mapModelIdToSonar, getPromptLengthCategory } from './sonarPricing';

export interface ModelInfo {
  id: string;            // Internal ID used in the system
  displayName: string;   // User-friendly display name
  provider: ModelProvider; // The company providing the model
  type: ModelType;       // Type of model (text, image, etc.)
  baseCost: number;      // Base cost in credits (without creator fee or platform fee)
  capabilities: Array<'text' | 'image' | 'code'>; // What this model can do
  status: 'active' | 'deprecated' | 'beta'; // Availability status
  description?: string;  // Optional description
  maxTokens?: number;    // Maximum token limit (for text models)
  maxPromptLength?: number; // Maximum prompt length
  tokensPerCredit?: number; // How many tokens per credit
  apiPricing?: {
    input?: number;      // $ per 1K input tokens
    output?: number;     // $ per 1K output tokens
    standard?: number;   // $ per standard image
    hd?: number;         // $ per HD image
  };
  averageUsage?: {
    inputTokens?: number; // Average input tokens used
    outputTokens?: number; // Average output tokens generated
  };
}

export type ModelProvider = 
  | 'openai'
  | 'perplexity'
  | 'anthropic'
  | 'stability'
  | 'internal';

export type ModelType = 
  | 'text'     // Text generation models
  | 'image'    // Image generation models
  | 'hybrid';  // Models that can handle both text and images

// Text generation models
export const TEXT_MODELS: ModelInfo[] = [
  {
    id: 'sonar-small-online',
    displayName: 'Sonar Small',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3400, // $0.0034 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Fast, efficient text model with good performance for simple tasks.',
    apiPricing: {
      input: 0.0008,
      output: 0.0016
    },
    averageUsage: {
      inputTokens: 500,
      outputTokens: 1000
    }
  },
  {
    id: 'sonar-small-chat',
    displayName: 'Sonar Small Chat',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3400, // $0.0034 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Optimized for conversational interactions with good responsiveness.',
    apiPricing: {
      input: 0.0008,
      output: 0.0016
    }
  },
  {
    id: 'sonar-medium-online',
    displayName: 'Sonar Medium',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3300, // $0.0033 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Balanced text model with good quality and reasonable response times.',
    apiPricing: {
      input: 0.0016,
      output: 0.0032
    },
    averageUsage: {
      inputTokens: 500,
      outputTokens: 1000
    }
  },
  {
    id: 'sonar-medium-chat',
    displayName: 'Sonar Medium Chat',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3300, // $0.0033 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'High-quality conversational model suited for complex dialogues.',
    apiPricing: {
      input: 0.0016,
      output: 0.0032
    }
  },
  {
    id: 'sonar-large-online',
    displayName: 'Sonar Large',
    provider: 'perplexity',
    type: 'text',
    baseCost: 30000, // $0.0300 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Most powerful Sonar model with excellent reasoning capabilities.',
    apiPricing: {
      input: 0.0024,
      output: 0.0088
    },
    averageUsage: {
      inputTokens: 500,
      outputTokens: 1000
    }
  },
  {
    id: 'sonar',
    displayName: 'Sonar Default',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3300, // $0.0033 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Standard Sonar model, balanced for most use cases.',
    apiPricing: {
      input: 0.0016,
      output: 0.0032
    }
  },
  {
    id: 'llama-3.1-sonar-small-128k-online',
    displayName: 'Llama 3.1 Sonar',
    provider: 'perplexity',
    type: 'text',
    baseCost: 3000, // $0.0030 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Open model with extended context window for larger documents.',
    maxTokens: 128000,
    apiPricing: {
      input: 0.0008,
      output: 0.0016
    }
  },
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'openai',
    type: 'hybrid',
    baseCost: 20000, // $0.0200 * 1,000,000
    capabilities: ['text', 'code', 'image'],
    status: 'active',
    description: 'Latest, multi-modal model from OpenAI with vision capabilities.',
    apiPricing: {
      input: 0.005,
      output: 0.015
    },
    averageUsage: {
      inputTokens: 500,
      outputTokens: 1000
    }
  },
  {
    id: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    provider: 'openai',
    type: 'text',
    baseCost: 40000, // $0.0400 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Powerful model with good balance of performance and cost.',
    apiPricing: {
      input: 0.01,
      output: 0.03
    }
  },
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    provider: 'openai',
    type: 'text',
    baseCost: 6000, // $0.0060 * 1,000,000
    capabilities: ['text', 'code'],
    status: 'active',
    description: 'Smaller, faster version of GPT-4o at a lower cost.',
    apiPricing: {
      input: 0.0015,
      output: 0.006
    }
  },
];

// Image generation models
export const IMAGE_MODELS: ModelInfo[] = [
  {
    id: 'gpt-image-1',
    displayName: 'GPT-image-1',
    provider: 'openai',
    type: 'image',
    baseCost: 50000, // $0.0500 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'Image editing and generation model from OpenAI.',
    apiPricing: {
      standard: 0.050  // $0.050 per image edit
    }
  },
  {
    id: 'dall-e-3',
    displayName: 'DALL-E 3',
    provider: 'openai',
    type: 'image',
    baseCost: 40000, // $0.0400 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'High quality image generation with excellent prompt following.',
    apiPricing: {
      standard: 0.040,
      hd: 0.080
    }
  },
  {
    id: 'dall-e-2',
    displayName: 'DALL-E 2',
    provider: 'openai',
    type: 'image',
    baseCost: 20000, // $0.0200 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'More affordable image generation option with good results.',
    apiPricing: {
      standard: 0.020
    }
  },
  {
    id: 'stable-diffusion-xl',
    displayName: 'Stable Diffusion XL',
    provider: 'stability',
    type: 'image',
    baseCost: 40000, // $0.0400 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'Open source image model with high-quality outputs.',
    apiPricing: {
      standard: 0.040
    }
  },
  {
    id: 'stability-xl-turbo',
    displayName: 'Stability AI XL Turbo',
    provider: 'stability',
    type: 'image',
    baseCost: 30000, // $0.0300 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'Faster image generation with good quality-speed balance.',
    apiPricing: {
      standard: 0.030
    }
  },
  {
    id: 'stability-xl-ultra',
    displayName: 'Stability AI XL Ultra',
    provider: 'stability',
    type: 'image',
    baseCost: 60000, // $0.0600 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'Ultra-high quality image generation with fine details.',
    apiPricing: {
      standard: 0.060
    }
  },
  {
    id: 'sdxl',
    displayName: 'SDXL',
    provider: 'stability',
    type: 'image',
    baseCost: 40000, // $0.0400 * 1,000,000
    capabilities: ['image'],
    status: 'active',
    description: 'Standard Stable Diffusion XL model.',
    apiPricing: {
      standard: 0.040
    }
  },
  {
    id: 'sd3',
    displayName: 'SD3',
    provider: 'stability',
    type: 'image',
    baseCost: 45000, // $0.0450 * 1,000,000
    capabilities: ['image'],
    status: 'beta',
    description: 'Latest generation of Stable Diffusion, currently in beta.',
    apiPricing: {
      standard: 0.045
    }
  }
];

// Combine all models without duplicates
const modelMap = new Map<string, ModelInfo>();

// Add TEXT_MODELS
TEXT_MODELS.forEach(model => {
  modelMap.set(model.id, model);
});

// Add IMAGE_MODELS if not already added
IMAGE_MODELS.forEach(model => {
  if (!modelMap.has(model.id)) {
    modelMap.set(model.id, model);
  }
});

// Convert map back to array
export const ALL_MODELS: ModelInfo[] = Array.from(modelMap.values());

// Helper functions

/**
 * Get a model by its ID
 * @param modelId The ID of the model to find
 * @returns The model info or undefined if not found
 */
export function getModelById(modelId: string): ModelInfo | undefined {
  return ALL_MODELS.find(model => model.id === modelId);
}

/**
 * Get all models of a specific type
 * @param type The type of models to get
 * @returns Array of models of the specified type
 */
export function getModelsByType(type: ModelType): ModelInfo[] {
  return ALL_MODELS.filter(model => model.type === type);
}

/**
 * Get all models from a specific provider
 * @param provider The provider to filter by
 * @returns Array of models from the specified provider
 */
export function getModelsByProvider(provider: ModelProvider): ModelInfo[] {
  return ALL_MODELS.filter(model => model.provider === provider);
}

/**
 * Get all active models
 * @returns Array of models with 'active' status
 */
export function getActiveModels(): ModelInfo[] {
  return ALL_MODELS.filter(model => model.status === 'active');
}

/**
 * Calculate the inference cost for a specific model and prompt
 * @param modelId The model ID
 * @param promptTokens The number of tokens in the prompt (default: standard chat length)
 * @returns The inference cost in credits
 */
export function calculateInferenceCost(modelId: string, promptTokens: number = 1000): number {
  // For Sonar models, use the Sonar pricing module
  const sonarMapping = mapModelIdToSonar(modelId);
  if (sonarMapping) {
    const promptLengthCategory = getPromptLengthCategory(promptTokens);
    return calculateSonarInferenceCost(
      sonarMapping.model,
      sonarMapping.tier,
      promptLengthCategory
    );
  }
  
  // For other models, use the base cost from the model info
  const model = getModelById(modelId);
  return model?.baseCost || 0;
}

/**
 * Get base cost for a model
 * @param modelId The ID of the model to get the cost for
 * @returns The base cost in credits, or a default if not found
 */
export function getModelBaseCost(modelId: string): number {
  const model = getModelById(modelId);
  return model?.baseCost || 25000; // Default to 25000 if model not found (equivalent to $0.025)
}

/**
 * Calculate platform fee based on inference cost using tiered pricing
 * @param inferenceCost The inference cost in credits
 * @returns The platform fee in credits
 */
export function calculatePlatformFee(inferenceCost: number): number {
  // Apply tiered markup rate to inference cost
  if (inferenceCost === 0) {
    return 1; // Minimum fee of 1 credit
  } else if (inferenceCost < 10000) { // < $0.01 → 20%
    return Math.max(Math.ceil(inferenceCost * 0.20), 1);
  } else if (inferenceCost < 100000) { // < $0.10 → 10%
    return Math.max(Math.ceil(inferenceCost * 0.10), 1);
  } else {
    return 500; // Flat 500 credits ($0.0005)
  }
}

/**
 * Calculate the total cost for running a prompt
 * @param modelId The model ID
 * @param creatorFee The creator fee in credits (optional, defaults to 0)
 * @param promptTokens The number of tokens in the prompt (optional, defaults to standard chat length)
 * @returns The total cost in credits
 */
export function calculateTotalPromptCost(
  modelId: string, 
  creatorFee: number = 0, 
  promptTokens: number = 1000
): number {
  // Get inference cost
  const inferenceCost = calculateInferenceCost(modelId, promptTokens);
  
  // Calculate platform fee using tiered pricing
  const platformFee = calculatePlatformFee(inferenceCost);
  
  // Total cost = inference cost + platform fee + creator fee
  return inferenceCost + platformFee + creatorFee;
}

/**
 * Generate user-friendly cost breakdown
 * @param modelId The model ID
 * @param creatorFee The creator fee
 * @param promptTokens The number of tokens in the prompt (optional)
 * @returns Object with formatted cost breakdown
 */
export function getCostBreakdown(
  modelId: string, 
  creatorFee: number = 0,
  promptTokens: number = 1000
): {
  inferenceCost: number;
  platformFee: number;
  creatorFee: number;
  totalCost: number;
  dollarCost: string;
  runsFor10Dollars: number;
} {
  // Get inference cost
  const inferenceCost = calculateInferenceCost(modelId, promptTokens);
  
  // Calculate platform fee using tiered pricing
  const platformFee = calculatePlatformFee(inferenceCost);
  
  // Calculate total cost
  const totalCost = inferenceCost + platformFee + creatorFee;
  
  // Convert to dollars
  const dollarCost = (totalCost / 1000000).toFixed(6);
  
  // Calculate runs for $10
  const runsFor10Dollars = getRunsPerDollar(modelId, creatorFee, 10, promptTokens);
  
  return {
    inferenceCost,
    platformFee,
    creatorFee,
    totalCost,
    dollarCost,
    runsFor10Dollars,
  };
}

/**
 * Get approximate number of runs for a given dollar amount
 * @param modelId The model ID
 * @param creatorFee The additional creator fee
 * @param dollarAmount The dollar amount to calculate runs for
 * @param promptTokens The number of tokens in the prompt (optional)
 * @returns Number of runs possible (rounded down)
 */
export function getRunsPerDollar(
  modelId: string, 
  creatorFee: number = 0, 
  dollarAmount: number,
  promptTokens: number = 1000
): number {
  // Get inference cost
  const inferenceCost = calculateInferenceCost(modelId, promptTokens);
  if (inferenceCost === 0) return 0;
  
  // Calculate platform fee using tiered pricing
  const platformFee = calculatePlatformFee(inferenceCost);
  
  // Total cost per run
  const totalCostPerRun = inferenceCost + platformFee + creatorFee;
  
  // 1,000,000 credits = $1, so dollarAmount * 1,000,000 = total credits
  const totalCredits = dollarAmount * 1000000;
  
  // Calculate runs and round down
  return Math.floor(totalCredits / totalCostPerRun);
}

/**
 * Calculate the dollar cost for a single run
 * @param modelId The model ID
 * @param creatorFee The creator fee
 * @param promptTokens The number of tokens in the prompt (optional)
 * @returns Dollar cost for a single run
 */
export function getDollarCostPerRun(
  modelId: string, 
  creatorFee: number = 0,
  promptTokens: number = 1000
): number {
  // Get inference cost
  const inferenceCost = calculateInferenceCost(modelId, promptTokens);
  
  // Calculate platform fee using tiered pricing
  const platformFee = calculatePlatformFee(inferenceCost);
  
  // Total cost per run
  const totalCostPerRun = inferenceCost + platformFee + creatorFee;
  
  // Convert to dollars (1,000,000 credits = $1)
  return totalCostPerRun / 1000000;
}
