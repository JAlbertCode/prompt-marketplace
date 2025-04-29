/**
 * Utilities for credit management
 */

import { SonarModel, ImageModel } from '@/types';

/**
 * Get the baseline cost for a specific model
 * @param model The model to get the baseline cost for
 * @returns The baseline cost in credits
 */
export function getBaselineCost(model: SonarModel | ImageModel): number {
  const costMap: Record<string, number> = {
    // Text models
    'sonar-small-online': 15,
    'sonar-small-chat': 15,
    'sonar-medium-online': 25,
    'sonar-medium-chat': 25,
    'sonar-large-online': 40,
    'sonar': 25, // Default model
    'llama-3.1-sonar-small-128k-online': 20,
    
    // Image models
    'dall-e-2': 50,
    'dall-e-3': 100,
    'stable-diffusion-xl': 80,
    'stability-xl-turbo': 60,
    'stability-xl-ultra': 120,
    'sdxl': 80,
    'sd3': 90
  };
  
  return costMap[model] || 25; // Default to 25 credits if model not found
}

/**
 * Check if a credit cost is valid for a specific model
 * @param cost The cost to check
 * @param model The model to check against
 * @returns True if the cost is valid, false otherwise
 */
export function isValidCreditCost(cost: number, model: SonarModel | ImageModel): boolean {
  // Get the baseline cost for the model
  const baselineCost = getBaselineCost(model);
  
  // Cost must be at least the baseline
  return cost >= baselineCost;
}

/**
 * Calculate combined cost for text and image generation
 * @param textModel The text model
 * @param imageModel The image model
 * @returns The combined cost
 */
export function calculateCombinedCost(
  textModel?: SonarModel,
  imageModel?: ImageModel
): number {
  let totalCost = 0;
  
  // Add text model cost if provided
  if (textModel) {
    totalCost += getBaselineCost(textModel);
  }
  
  // Add image model cost if provided
  if (imageModel) {
    totalCost += getBaselineCost(imageModel);
  }
  
  return totalCost;
}

/**
 * Get warning level based on credit balance
 * @param credits Current credit balance
 * @returns Warning level
 */
export function getCreditWarningLevel(credits: number): 'none' | 'low' | 'critical' {
  if (credits <= 50) {
    return 'critical';
  } else if (credits <= 200) {
    return 'low';
  } else {
    return 'none';
  }
}

/**
 * Format credit amount with symbol
 * @param amount Credit amount
 * @returns Formatted credit string
 */
export function formatCredits(amount: number): string {
  return `💎 ${amount.toLocaleString()}`;
}

/**
 * Calculate discount for bulk credit purchase
 * @param amount Base credit amount
 * @returns Discount percentage
 */
export function getBulkDiscount(amount: number): number {
  if (amount >= 10000) {
    return 0.15; // 15% discount
  } else if (amount >= 5000) {
    return 0.10; // 10% discount
  } else if (amount >= 1000) {
    return 0.05; // 5% discount
  }
  return 0; // No discount
}
