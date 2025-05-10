/**
 * Credits System for PromptFlow
 * 
 * This file contains the core credit management functionality:
 * - Credit bucket management (purchased, bonus, referral)
 * - Credit burning with proper priority
 * - Transaction logging
 * - Creator payments
 * - Automation bonus logic
 * 
 * 1 credit = $0.000001 USD
 * $1 = 1,000,000 credits
 */

import { prisma } from '@/lib/db';
import { PromptLength, calculatePromptCreditCost, getModelById } from '@/lib/models/modelRegistry';

export type CreditBucketType = 'purchased' | 'bonus' | 'referral';

export interface BurnCreditsOptions {
  userId: string;
  modelId: string;
  promptText?: string; 
  promptLength?: PromptLength;
  creatorId?: string;
  creatorFeePercentage?: number;
  flowId?: string;
  itemType?: 'prompt' | 'flow' | 'completion';
  itemId?: string;
}

/**
 * Get user's credit buckets with proper burn priority:
 * 1. purchased
 * 2. bonus
 * 3. referral
 */
export async function getUserCreditBuckets(userId: string) {
  try {
    const buckets = await prisma.creditBucket.findMany({
      where: {
        userId,
        remaining: { gt: 0 },
        expiresAt: {
          OR: [
            { equals: null }, // Never expires
            { gt: new Date() }  // Not expired yet
          ]
        }
      },
      orderBy: [
        { createdAt: 'asc' } // Oldest first within each type
      ]
    });
    
    // Custom sort to enforce exact priority: purchased → bonus → referral
    return buckets.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        purchased: 0,
        bonus: 1,
        referral: 2
      };
      
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
  } catch (error) {
    console.error('Error getting credit buckets:', error);
    
    // In case of database issues, return an empty array
    // This ensures the application doesn't crash
    return [];
  }
}

/**
 * Get user's total available credits
 */
export async function getUserTotalCredits(userId: string): Promise<number> {
  try {
    const buckets = await getUserCreditBuckets(userId);
    return buckets.reduce((total, bucket) => total + bucket.remaining, 0);
  } catch (error) {
    console.error('Error getting total credits:', error);
    // Don't use fallback values - return 0 to indicate an error condition
    // The UI should handle this by showing an error message
    return 0;
  }
}

/**
 * Check if a user has enough credits for a specific operation
 */
export async function hasEnoughCredits(
  userId: string,
  cost: number
): Promise<boolean> {
  const totalCredits = await getUserTotalCredits(userId);
  return totalCredits >= cost;
}

/**
 * Burn credits for a prompt execution
 * 
 * Returns: 
 * - true if successful
 * - false if not enough credits
 */
export async function burnCredits(options: BurnCreditsOptions): Promise<boolean> {
  const { 
    userId, 
    modelId, 
    promptText, 
    promptLength = promptText ? undefined : 'medium',
    creatorId, 
    creatorFeePercentage = 0, 
    flowId,
    itemType,
    itemId
  } = options;
  
  // Determine prompt length if not provided
  const effectivePromptLength = promptLength || 
    (promptText ? (promptText.length < 1500 ? 'short' : promptText.length < 6000 ? 'medium' : 'long') : 'medium');
  
  // Calculate required credits
  const requiredCredits = calculatePromptCreditCost(modelId, effectivePromptLength, creatorFeePercentage);
  
  // Get available buckets
  const buckets = await getUserCreditBuckets(userId);
  
  // Check if user has enough credits
  const totalAvailable = buckets.reduce((sum, bucket) => sum + bucket.remaining, 0);
  if (totalAvailable < requiredCredits) {
    return false; // Not enough credits
  }
  
  // Get model info
  const model = getModelById(modelId);
  if (!model) {
    throw new Error(`Model ${modelId} not found`);
  }
  
  // Calculate base cost and creator fee
  const baseCost = model.cost[effectivePromptLength];
  const creatorFee = creatorFeePercentage > 0 
    ? Math.floor(baseCost * (creatorFeePercentage / 100)) 
    : 0;
  
  // Execute transaction
  return await prisma.$transaction(async (tx) => {
    let remainingToBurn = requiredCredits;
    
    // Burn from buckets in priority order
    for (const bucket of buckets) {
      if (remainingToBurn <= 0) break;
      
      const burnAmount = Math.min(bucket.remaining, remainingToBurn);
      
      await tx.creditBucket.update({
        where: { id: bucket.id },
        data: { remaining: { decrement: burnAmount } }
      });
      
      remainingToBurn -= burnAmount;
    }
    
    // Log the transaction
    await tx.creditTransaction.create({
      data: {
        userId,
        modelId,
        creditsUsed: requiredCredits,
        flowId: flowId || null,
        creatorId: creatorId || null,
        creatorFeePercentage: creatorFeePercentage || 0,
        itemType: itemType || 'completion',
        itemId: itemId || null,
        promptLength: effectivePromptLength
      }
    });
    
    // If there's a creator fee, distribute it
    if (creatorId && creatorFee > 0) {
      const platformShare = Math.floor(creatorFee * 0.2); // Platform takes 20%
      const creatorShare = creatorFee - platformShare;
      
      // Credit creator's account (80% of the creator fee)
      if (creatorShare > 0) {
        await tx.creditBucket.create({
          data: {
            userId: creatorId,
            type: 'bonus',
            amount: creatorShare,
            remaining: creatorShare,
            source: `prompt_execution:${userId}`,
            // Set expiry for 90 days from now
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        });
      }
    }
    
    return true;
  });
}

/**
 * Add credits to a user's account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditBucketType = 'purchased',
  source: string = 'manual_addition',
  expiryDays: number | null = null
) {
  try {
    const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;
    
    return await prisma.creditBucket.create({
      data: {
        userId,
        type,
        amount,
        remaining: amount,
        source,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error; // Propagate the error to be handled by caller
  }
}

/**
 * Add automation bonus based on monthly usage
 */
export async function addAutomationBonus(userId: string, monthlyBurn: number) {
  let bonusAmount = 0;
  
  // Determine bonus tier based on monthly burn
  if (monthlyBurn >= 1400000) {
    bonusAmount = 400000; // Auto-enterprise tier
  } else if (monthlyBurn >= 600000) {
    bonusAmount = 100000;
  } else if (monthlyBurn >= 300000) {
    bonusAmount = 40000;
  } else if (monthlyBurn >= 100000) {
    bonusAmount = 10000;
  }
  
  if (bonusAmount > 0) {
    await addCredits(
      userId, 
      bonusAmount, 
      'bonus', 
      'automation_bonus', 
      30 // 30 days expiry
    );
    
    // Also log the bonus allocation
    await prisma.creditBonus.create({
      data: {
        userId,
        amount: bonusAmount,
        reason: 'automation_monthly',
        monthlyBurn
      }
    });
  }
}

/**
 * Get credit breakdown by bucket type
 */
export async function getUserCreditBreakdown(userId: string): Promise<Record<CreditBucketType, number>> {
  const buckets = await getUserCreditBuckets(userId);
  
  return buckets.reduce((acc, bucket) => {
    const type = bucket.type as CreditBucketType;
    acc[type] = (acc[type] || 0) + bucket.remaining;
    return acc;
  }, { purchased: 0, bonus: 0, referral: 0 } as Record<CreditBucketType, number>);
}

/**
 * Get user's credit history (transactions)
 */
export async function getUserCreditHistory(userId: string, limit: number = 10, offset: number = 0) {
  return await prisma.creditTransaction.findMany({
    where: { 
      OR: [
        { userId },
        { creatorId: userId }
      ]
    },
    include: {
      model: true,
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit
  });
}

/**
 * Calculate the credit bundles for purchasing
 * 
 * Price	Base	Bonus	Total
 * $10	10M	0	10M
 * $25	25M	2.5M	27.5M
 * $50	50M	7.5M	57.5M
 * $100	100M	20M	120M
 * Enterprise	100M	40M	140M
 */
export function getCreditBundles() {
  return [
    {
      id: 'starter',
      name: 'Starter',
      price: 10, // $10
      baseCredits: 10_000_000, // 10M
      bonusCredits: 0,
      totalCredits: 10_000_000, // 10M
      pricePerMillion: 1.00 // $1.00 per million
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 25, // $25
      baseCredits: 25_000_000, // 25M
      bonusCredits: 2_500_000, // 2.5M
      totalCredits: 27_500_000, // 27.5M
      pricePerMillion: 0.91 // $0.91 per million
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 50, // $50
      baseCredits: 50_000_000, // 50M
      bonusCredits: 7_500_000, // 7.5M
      totalCredits: 57_500_000, // 57.5M
      pricePerMillion: 0.87 // $0.87 per million
    },
    {
      id: 'business',
      name: 'Business',
      price: 100, // $100
      baseCredits: 100_000_000, // 100M
      bonusCredits: 20_000_000, // 20M
      totalCredits: 120_000_000, // 120M
      pricePerMillion: 0.83 // $0.83 per million
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 100, // $100
      baseCredits: 100_000_000, // 100M
      bonusCredits: 40_000_000, // 40M
      totalCredits: 140_000_000, // 140M
      pricePerMillion: 0.71, // $0.71 per million
      requiresMonthlyBurn: 1_400_000 // Requires 1.4M monthly burn
    }
  ];
}