/**
 * Model Registry for PromptFlow
 * 
 * This file contains all available models and their pricing information.
 * All costs are in credits (1 credit = $0.000001 USD)
 */

export type ModelCost = {
  short: number;  // Credits for short prompts
  medium: number; // Credits for medium prompts
  long: number;   // Credits for long prompts
};

export type ModelDefinition = {
  id: string;
  provider: string;
  name: string;
  displayName?: string; // More user-friendly name for display
  inputType: 'text' | 'audio' | 'image';
  outputType: 'text' | 'audio' | 'image';
  cost: ModelCost;
  endpoint: string;
  description?: string;
  isAvailable?: boolean;
};

export const models: ModelDefinition[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    provider: "openai",
    name: "GPT-4o Text",
    displayName: "GPT-4o",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 8500,
      medium: 15000,
      long: 23500
    },
    endpoint: "/api/run/openai/gpt4o",
    description: "OpenAI's most capable multimodal model",
    isAvailable: true
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    name: "GPT-4o Mini Text",
    displayName: "GPT-4o Mini",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 1000,
      medium: 1800,
      long: 2800
    },
    endpoint: "/api/run/openai/gpt4o-mini",
    description: "Lightweight version of GPT-4o at a reduced cost",
    isAvailable: true
  },
  {
    id: "gpt-4o-audio",
    provider: "openai",
    name: "GPT-4o Audio",
    displayName: "GPT-4o Audio",
    inputType: "audio",
    outputType: "text",
    cost: {
      short: 44000,
      medium: 80000,
      long: 124000
    },
    endpoint: "/api/run/openai/gpt4o-audio",
    description: "Process audio inputs with GPT-4o",
    isAvailable: true
  },
  {
    id: "gpt-4o-mini-audio",
    provider: "openai",
    name: "GPT-4o Mini Audio",
    displayName: "GPT-4o Mini Audio",
    inputType: "audio",
    outputType: "text",
    cost: {
      short: 11000,
      medium: 20000,
      long: 31000
    },
    endpoint: "/api/run/openai/gpt4o-mini-audio",
    description: "Process audio at a reduced cost",
    isAvailable: true
  },
  {
    id: "gpt-image-1-text",
    provider: "openai",
    name: "GPT-Image-1 Text",
    displayName: "GPT-Image-1",
    inputType: "text",
    outputType: "image",
    cost: {
      short: 5000,
      medium: 5000,
      long: 5000
    },
    endpoint: "/api/run/openai/gpt-image-1",
    description: "Generate images from text prompts",
    isAvailable: true
  },
  {
    id: "gpt-image-1-image",
    provider: "openai",
    name: "GPT-Image-1 Image",
    displayName: "GPT-Image-1 (Image Input)",
    inputType: "image",
    outputType: "image",
    cost: {
      short: 17000,
      medium: 30000,
      long: 47000
    },
    endpoint: "/api/run/openai/gpt-image-1-image",
    description: "Edit or generate based on input images",
    isAvailable: true
  },
  {
    id: "o3",
    provider: "openai",
    name: "OpenAI o3",
    displayName: "OpenAI o3",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 17000,
      medium: 30000,
      long: 47000
    },
    endpoint: "/api/run/openai/o3",
    description: "Advanced text generation model",
    isAvailable: true
  },
  {
    id: "o4-mini",
    provider: "openai",
    name: "OpenAI o4-mini",
    displayName: "OpenAI o4-mini",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 1900,
      medium: 3300,
      long: 5200
    },
    endpoint: "/api/run/openai/o4-mini",
    description: "Efficient and cost-effective text generation",
    isAvailable: true
  },
  
  // Sonar Models
  {
    id: "sonar-pro-low",
    provider: "sonar",
    name: "Sonar Pro Low",
    displayName: "Sonar Pro (Low)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 3400,
      medium: 6000,
      long: 9400
    },
    endpoint: "/api/run/sonar/pro-low",
    description: "Sonar Pro optimized for efficiency",
    isAvailable: true
  },
  {
    id: "sonar-pro-medium",
    provider: "sonar",
    name: "Sonar Pro Medium",
    displayName: "Sonar Pro (Medium)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 700,
      medium: 1200,
      long: 1900
    },
    endpoint: "/api/run/sonar/pro-medium",
    description: "Balanced performance Sonar model",
    isAvailable: true
  },
  {
    id: "sonar-pro-high",
    provider: "sonar",
    name: "Sonar Pro High",
    displayName: "Sonar Pro (High)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 200,
      medium: 300,
      long: 500
    },
    endpoint: "/api/run/sonar/pro-high",
    description: "Maximum capability Sonar model",
    isAvailable: true
  },
  {
    id: "sonar-low",
    provider: "sonar",
    name: "Sonar Low",
    displayName: "Sonar (Low)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 17000,
      medium: 30000,
      long: 47000
    },
    endpoint: "/api/run/sonar/low",
    description: "Standard Sonar model (low tier)",
    isAvailable: true
  },
  {
    id: "sonar-medium",
    provider: "sonar",
    name: "Sonar Medium",
    displayName: "Sonar (Medium)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 1900,
      medium: 3300,
      long: 5200
    },
    endpoint: "/api/run/sonar/medium",
    description: "Standard Sonar model (medium tier)",
    isAvailable: true
  },
  {
    id: "sonar-high",
    provider: "sonar",
    name: "Sonar High",
    displayName: "Sonar (High)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 8500,
      medium: 15000,
      long: 23500
    },
    endpoint: "/api/run/sonar/high",
    description: "Standard Sonar model (high tier)",
    isAvailable: true
  },
  {
    id: "sonar-reasoning-pro-low",
    provider: "sonar",
    name: "Sonar Reasoning Pro Low",
    displayName: "Sonar Reasoning Pro (Low)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 1000,
      medium: 1800,
      long: 2800
    },
    endpoint: "/api/run/sonar/reasoning-pro-low",
    description: "Enhanced reasoning capabilities (low tier)",
    isAvailable: true
  },
  {
    id: "sonar-reasoning-pro-medium",
    provider: "sonar",
    name: "Sonar Reasoning Pro Medium",
    displayName: "Sonar Reasoning Pro (Medium)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 44000,
      medium: 80000,
      long: 124000
    },
    endpoint: "/api/run/sonar/reasoning-pro-medium",
    description: "Enhanced reasoning capabilities (medium tier)",
    isAvailable: true
  },
  {
    id: "sonar-reasoning-pro-high",
    provider: "sonar",
    name: "Sonar Reasoning Pro High",
    displayName: "Sonar Reasoning Pro (High)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 11000,
      medium: 20000,
      long: 31000
    },
    endpoint: "/api/run/sonar/reasoning-pro-high",
    description: "Enhanced reasoning capabilities (high tier)",
    isAvailable: true
  },
  {
    id: "sonar-reasoning-low",
    provider: "sonar",
    name: "Sonar Reasoning Low",
    displayName: "Sonar Reasoning (Low)",
    inputType: "text",
    outputType: "text",
    cost: {
      short: 17000,
      medium: 30000,
      long: 47000
    },
    endpoint: "/api/run/sonar/reasoning-low",
    description: "Standard reasoning model (low tier)",
    isAvailable: true
  }
];

/**
 * Get a model by its ID
 */
export function getModelById(modelId: string): ModelDefinition | undefined {
  return models.find((model) => model.id === modelId);
}

export type PromptLength = 'short' | 'medium' | 'long';

/**
 * Calculate cost for a prompt based on model and length
 */
export function calculatePromptCost(
  modelId: string, 
  promptLength: PromptLength,
  creatorFee: number = 0
): number {
  const model = getModelById(modelId);
  
  if (!model) {
    throw new Error(`Model with ID '${modelId}' not found`);
  }
  
  // Get base cost for the prompt length
  const baseCost = model.cost[promptLength];
  
  // Add creator fee if present
  const totalCost = baseCost + creatorFee;
  
  return totalCost;
}

/**
 * Calculate credit cost for a prompt execution
 * This is an alias for calculatePromptCost for backward compatibility
 */
export function calculatePromptCreditCost(
  modelId: string,
  promptLength: PromptLength,
  creatorFeePercentage: number = 0
): number {
  const model = getModelById(modelId);
  
  if (!model) {
    throw new Error(`Model with ID '${modelId}' not found`);
  }
  
  // Get base cost for the prompt length
  const baseCost = model.cost[promptLength];
  
  // Calculate creator fee if percentage is provided
  const creatorFee = creatorFeePercentage > 0 
    ? Math.floor(baseCost * (creatorFeePercentage / 100)) 
    : 0;
  
  // Add creator fee to base cost
  const totalCost = baseCost + creatorFee;
  
  return totalCost;
}

/**
 * Determine prompt length category based on token/character count
 */
export function getPromptLengthCategory(
  tokenCount: number,
  provider: string
): PromptLength {
  // Different providers may have different thresholds
  if (provider === 'openai') {
    if (tokenCount <= 1000) return 'short';
    if (tokenCount <= 4000) return 'medium';
    return 'long';
  }
  
  if (provider === 'sonar') {
    if (tokenCount <= 800) return 'short';
    if (tokenCount <= 3000) return 'medium';
    return 'long';
  }
  
  // Default threshold
  if (tokenCount <= 1000) return 'short';
  if (tokenCount <= 3500) return 'medium';
  return 'long';
}
