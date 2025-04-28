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

/**
 * Get the baseline credit cost for a given Sonar model
 * @param model The Sonar model to get the cost for
 * @returns The baseline credit cost
 */
export function getBaselineCost(model: SonarModel): number {
  return MODEL_CREDIT_COSTS[model] || 25; // Default to 25 if model not found
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
