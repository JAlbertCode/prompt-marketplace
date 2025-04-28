import { SonarModel } from '@/types';

/**
 * Maps Sonar models to their baseline credit costs
 */
export const MODEL_CREDIT_COSTS: Record<SonarModel, number> = {
  'sonar-small-online': 15,
  'sonar-medium-chat': 25,
  'sonar-medium-online': 25,
  'sonar-large-online': 40,
  'sonar-small-chat': 15,
  'llama-3.1-sonar-small-128k-online': 20,
  'sonar': 25,
};

// Minimum platform fee when no creator fee is set
export const MINIMUM_PLATFORM_FEE = 100;

// Platform cut percentage from creator fees (20-30%)
export const PLATFORM_CUT_PERCENTAGE = 25; // 25% is the midpoint

/**
 * Get the baseline credit cost for a given Sonar model
 * @param model The Sonar model to get the cost for
 * @returns The baseline credit cost
 */
export function getBaselineCost(model: SonarModel): number {
  return MODEL_CREDIT_COSTS[model] || 25; // Default to 25 if model not found
}

/**
 * Calculate the platform fee based on creator fee
 * @param creatorFee The creator fee in credits
 * @returns The platform fee in credits
 */
export function calculatePlatformFee(creatorFee: number): number {
  if (creatorFee <= 0) {
    // Apply minimum platform fee if no creator fee
    return MINIMUM_PLATFORM_FEE;
  }
  
  // Otherwise take a percentage of the creator fee
  return Math.ceil((creatorFee * PLATFORM_CUT_PERCENTAGE) / 100);
}

/**
 * Calculate the total cost for running a prompt
 * @param baselineCost The baseline cost for the model
 * @param creatorFee The optional creator fee
 * @returns The total cost and breakdown
 */
export function calculateTotalCost(baselineCost: number, creatorFee: number = 0): {
  baselineCost: number;
  creatorFee: number;
  platformFee: number;
  totalCost: number;
} {
  const platformFee = calculatePlatformFee(creatorFee);
  
  return {
    baselineCost,
    creatorFee,
    platformFee,
    totalCost: baselineCost + creatorFee + platformFee
  };
}

/**
 * Check if a credit cost is valid for a given model
 * @param cost The credit cost to check
 * @param model The Sonar model
 * @returns Whether the cost is valid
 */
export function isValidCreditCost(cost: number, model: SonarModel): boolean {
  const baselineCost = getBaselineCost(model);
  return cost >= baselineCost;
}

/**
 * Format credits for display
 * @param credits Number of credits
 * @returns Formatted credit string
 */
export function formatCredits(credits: number): string {
  return new Intl.NumberFormat('en-US').format(credits);
}

/**
 * Convert credits to approximate dollar value
 * @param credits Number of credits
 * @returns Dollar value string
 */
export function creditsToUSD(credits: number): string {
  // 1000 credits = $1
  const dollars = credits / 1000;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  });
}

/**
 * Check if user has enough credits for a transaction
 * @param userCredits Current user's credit balance
 * @param requiredCredits Credits needed for transaction
 * @returns Boolean indicating if user has enough credits
 */
export function hasEnoughCredits(userCredits: number, requiredCredits: number): boolean {
  return userCredits >= requiredCredits;
}

/**
 * Calculate credit warning level
 * @param credits Current credit balance
 * @returns Warning level (none, low, critical)
 */
export function getCreditWarningLevel(credits: number): 'none' | 'low' | 'critical' {
  if (credits < 50) return 'critical';
  if (credits < 200) return 'low';
  return 'none';
}
