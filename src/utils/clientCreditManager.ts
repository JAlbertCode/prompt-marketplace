/**
 * Client-side Credit Manager
 * 
 * Safe version of creditManager.ts that doesn't use Prisma directly in the browser.
 * This file provides API-based alternatives to database operations.
 */

import { toast } from 'react-hot-toast';

/**
 * Get user's credit balance from API
 * @param userId User ID
 * @returns Number of credits available
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const response = await fetch(`/api/credits/balance?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch credit balance');
    }
    
    const data = await response.json();
    return data.balance || 0;
  } catch (error) {
    console.error('Error fetching credits:', error);
    
    // In case of errors (DB fallback mode), return a default value
    // This matches the fallback behavior in the server-side code
    return 10_000_000; // Default to 10M credits in fallback mode
  }
}

/**
 * Deduct credits from user's account
 * @param userId User ID
 * @param amount Amount of credits to deduct
 * @param description Transaction description
 * @param type Transaction type
 * @returns New balance or null if insufficient credits
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  type: string
): Promise<number | null> {
  try {
    const response = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        description,
        type,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deduct credits');
    }
    
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Error deducting credits:', error);
    toast.error('Failed to process credit transaction');
    return null;
  }
}

/**
 * Calculate the cost of running a prompt
 * @param promptId Prompt ID
 * @param modelId Model ID
 * @param promptLength Optional prompt length (short, medium, long)
 * @returns Cost breakdown
 */
export async function calculatePromptRunCost(
  promptId: string,
  modelId: string,
  promptLength?: 'short' | 'medium' | 'long'
): Promise<{ inferenceCost: number; creatorFee: number; platformMarkup: number; totalCost: number }> {
  try {
    const response = await fetch(`/api/credits/calculate-cost?promptId=${promptId}&modelId=${modelId}${promptLength ? `&promptLength=${promptLength}` : ''}`);
    
    if (!response.ok) {
      throw new Error('Failed to calculate prompt cost');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating prompt cost:', error);
    
    // Return default values in case of error
    return {
      inferenceCost: 8500, // Default to medium GPT-4o cost
      creatorFee: 0,
      platformMarkup: 850, // 10% markup
      totalCost: 9350,
    };
  }
}

/**
 * Estimate prompt length based on text
 * @param text The text content to analyze
 * @returns The estimated prompt length category
 */
export function estimatePromptLength(text: string): 'short' | 'medium' | 'long' {
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
 * Check if a user has enough credits for a specific amount
 * @param userId User ID 
 * @param amount Credit amount
 * @returns Boolean indicating if user has enough credits
 */
export async function checkCreditBalance(userId: string, amount: number): Promise<boolean> {
  try {
    const balance = await getUserCredits(userId);
    return balance >= amount;
  } catch (error) {
    console.error('Error checking credit balance:', error);
    return false;
  }
}

/**
 * Get credit dollar value (for display purposes)
 * @param credits Number of credits
 * @returns Dollar value as a string
 */
export function creditsToDollars(credits: number): string {
  // 1 credit = $0.000001
  const dollars = credits * 0.000001;
  
  if (dollars < 0.01) {
    // Use scientific notation for very small amounts
    return `$${dollars.toExponential(6)}`;
  }
  
  return `$${dollars.toFixed(6)}`;
}

/**
 * Convert dollars to credits
 * @param dollars Dollar amount
 * @returns Number of credits (rounded to whole number)
 */
export function dollarsToCredits(dollars: number): number {
  // $1 = 1,000,000 credits
  return Math.round(dollars * 1_000_000);
}