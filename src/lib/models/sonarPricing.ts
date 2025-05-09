/**
 * Sonar Token Pricing module
 * Handles specific pricing calculations for Sonar models
 */

// Define pricing types
export type SonarModelType = 
  | 'sonar_pro'
  | 'sonar'
  | 'sonar_reasoning_pro'
  | 'sonar_reasoning'
  | 'sonar_deep_research';

export type SonarTier = 
  | 'low'
  | 'medium'
  | 'high'
  | 'none';

export type PromptLengthCategory = 
  | 'short'
  | 'standard'
  | 'long';

// Sonar pricing table (USD prices)
// Format: [model][tier][length_category]
export const SONAR_PRICING: Record<SonarModelType, Partial<Record<SonarTier, Partial<Record<PromptLengthCategory, number>>>>> = {
  'sonar_pro': {
    'low': {
      'short': 0.0034,
      'standard': 0.0060,
      'long': 0.0094,
    },
    'medium': {
      'short': 0.0007,
      'standard': 0.0012,
      'long': 0.0019,
    },
    'high': {
      'short': 0.0002,
      'standard': 0.0003,
      'long': 0.0005,
    },
  },
  'sonar': {
    'low': {
      'short': 0.0170,
      'standard': 0.0300,
      'long': 0.0470,
    },
    'medium': {
      'short': 0.0019,
      'standard': 0.0033,
      'long': 0.0052,
    },
    'high': {
      'short': 0.0085,
      'standard': 0.0150,
      'long': 0.0235,
    },
  },
  'sonar_reasoning_pro': {
    'low': {
      'short': 0.0010,
      'standard': 0.0018,
      'long': 0.0028,
    },
    'medium': {
      'short': 0.0440,
      'standard': 0.0800,
      'long': 0.1240,
    },
    'high': {
      'short': 0.0110,
      'standard': 0.0200,
      'long': 0.0310,
    },
  },
  'sonar_reasoning': {
    'low': {
      'short': 0.0170,
      'standard': 0.0300,
      'long': 0.0470,
    },
    // Medium and High tiers not available
  },
  'sonar_deep_research': {
    'none': {
      'short': 0.0020,
      'standard': 0.0080,
      'long': 0.0050,
    },
  },
};

/**
 * Calculate inference cost in credits for a Sonar model
 * @param model The Sonar model type
 * @param tier The tier (low, medium, high, none)
 * @param promptLength The prompt length category (short, standard, long)
 * @returns The inference cost in credits (1 credit = $0.000001)
 */
export function calculateSonarInferenceCost(
  model: SonarModelType,
  tier: SonarTier,
  promptLength: PromptLengthCategory
): number {
  try {
    // Get the USD price from the pricing table
    const usdPrice = SONAR_PRICING[model]?.[tier]?.[promptLength];
    
    if (usdPrice === undefined) {
      console.warn(`Price not defined for model: ${model}, tier: ${tier}, length: ${promptLength}`);
      return 0;
    }
    
    // Convert USD to credits (1 credit = $0.000001)
    const credits = Math.ceil(usdPrice * 1000000);
    
    return credits;
  } catch (error) {
    console.error('Error calculating Sonar inference cost:', error);
    return 0;
  }
}

/**
 * Map a model ID to Sonar model type and tier
 * @param modelId The model ID from the model registry
 * @returns The Sonar model type and tier, or null if not a Sonar model
 */
export function mapModelIdToSonar(modelId: string): { model: SonarModelType; tier: SonarTier } | null {
  // Parse model ID to extract Sonar model type and tier
  if (modelId.startsWith('sonar-')) {
    const parts = modelId.split('-');
    
    // Handle different Sonar model ID formats
    if (parts.length >= 2) {
      let model: SonarModelType;
      let tier: SonarTier;
      
      // Determine model type
      if (parts[1] === 'pro') {
        model = 'sonar_pro';
      } else if (parts[1] === 'reasoning') {
        if (parts.length >= 3 && parts[2] === 'pro') {
          model = 'sonar_reasoning_pro';
        } else {
          model = 'sonar_reasoning';
        }
      } else if (parts[1] === 'deep' && parts[2] === 'research') {
        model = 'sonar_deep_research';
        return { model, tier: 'none' };
      } else {
        model = 'sonar';
      }
      
      // Determine tier
      const tierPart = parts[parts.length - 1];
      if (tierPart === 'low' || tierPart === 'small') {
        tier = 'low';
      } else if (tierPart === 'medium') {
        tier = 'medium';
      } else if (tierPart === 'high' || tierPart === 'large') {
        tier = 'high';
      } else {
        tier = 'medium'; // Default to medium if not specified
      }
      
      return { model, tier };
    }
  }
  
  // Not a Sonar model
  return null;
}

/**
 * Determine the prompt length category based on token count
 * @param tokenCount The number of tokens in the prompt
 * @returns The prompt length category
 */
export function getPromptLengthCategory(tokenCount: number): PromptLengthCategory {
  if (tokenCount <= 500) {
    return 'short';
  } else if (tokenCount <= 2000) {
    return 'standard';
  } else {
    return 'long';
  }
}
