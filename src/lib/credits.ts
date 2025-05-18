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

import { supabase, querySupabase } from '@/lib/supabase';
import { PromptLength, calculatePromptCreditCost, getModelById } from '@/lib/models/modelRegistry';
import { checkAutoRenewalThreshold } from '@/lib/autoRenewal';

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
 * Get user's total available credits directly from the database
 * Bypasses authentication middleware for displaying in UI
 */
export async function getDirectUserCredits(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    // Query the database directly to get credit buckets
    const { data: creditBuckets, error } = await supabase
      .from('credit_ledger')
      .select('remaining')
      .eq('user_id', userId)
      .gt('remaining', 0)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    
    if (error) {
      console.error('Error getting direct credits:', error);
      return 0;
    }
    
    // Sum the remaining credits
    return creditBuckets?.reduce((total, bucket) => total + bucket.remaining, 0) || 0;
  } catch (error) {
    console.error('Error in direct credit fetch:', error);
    return 0;
  }
}

/**
 * Get user's credit buckets with proper burn priority:
 * 1. purchased
 * 2. bonus
 * 3. referral
 */
export async function getUserCreditBuckets(userId: string) {
  try {
    // Fetch buckets that never expire (expires_at is null)
    const { data: neverExpiringBuckets, error: error1 } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .gt('remaining', 0)
      .is('expires_at', null)
      .order('created_at', { ascending: true });

    // Fetch buckets that have not expired yet
    const { data: notYetExpiredBuckets, error: error2 } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .gt('remaining', 0)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    
    if (error1 || error2) {
      console.error('Error fetching credit buckets:', error1 || error2);
      return [];
    }
    
    // Combine both result sets
    const allBuckets = [...(neverExpiringBuckets || []), ...(notYetExpiredBuckets || [])];
    
    // Custom sort to enforce exact priority: purchased → bonus → referral
    return allBuckets.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        purchased: 0,
        bonus: 1,
        referral: 2
      };
      
      return priorityOrder[a.source] - priorityOrder[b.source];
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
  // Don't try to load user-specific data if we don't have a real user ID
  if (!userId || userId === 'unknown') {
    return 0; // Default to 0 when we can't identify the user
  }
  
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
  
  try {
    // Start a transaction (we'll use multiple operations with error handling)
    let remainingToBurn = requiredCredits;
    let burnDetails = [];
      
    // Burn from buckets in priority order
    for (const bucket of buckets) {
      if (remainingToBurn <= 0) break;
        
      const burnAmount = Math.min(bucket.remaining, remainingToBurn);
      const newRemaining = bucket.remaining - burnAmount;

      // Track updates to be made
      burnDetails.push({
        bucketId: bucket.id,
        burnAmount,
        newRemaining
      });
        
      remainingToBurn -= burnAmount;
    }

    // Exit if we couldn't satisfy the total burn amount
    if (remainingToBurn > 0) {
      console.error('Failed to burn all required credits');
      return false;
    }
      
    // Apply all the burns
    for (const detail of burnDetails) {
      const { error } = await supabase
        .from('credit_ledger')
        .update({ remaining: detail.newRemaining })
        .eq('id', detail.bucketId);
        
      if (error) {
        console.error('Error updating credit bucket:', error);
        throw error; // Will be caught by outer try/catch
      }

      // Record the burn in the credit_burns table
      const { error: burnError } = await supabase
        .from('credit_burns')
        .insert({
          user_id: userId,
          prompt_id: itemType === 'prompt' ? itemId : null,
          flow_id: flowId || null,
          model_id: modelId,
          length: effectivePromptLength,
          credits_used: detail.burnAmount,
          from_bucket_id: detail.bucketId,
          creator_id: creatorId || null,
          creator_fee: creatorId && creatorFee > 0 ? Math.floor(detail.burnAmount * (creatorFee / requiredCredits)) : 0
        });

      if (burnError) {
        console.error('Error recording credit burn:', burnError);
        throw burnError;
      }
    }
      
    // If there's a creator fee, distribute it
    if (creatorId && creatorFee > 0) {
      const platformShare = Math.floor(creatorFee * 0.2); // Platform takes 20%
      const creatorShare = creatorFee - platformShare;
        
      // Credit creator's account (80% of the creator fee)
      if (creatorShare > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 90 days from now
          
        const { error: creditError } = await supabase
          .from('credit_ledger')
          .insert({
            user_id: creatorId,
            amount: creatorShare,
            remaining: creatorShare,
            source: 'bonus',
            stripe_payment_id: null,
            expires_at: expiresAt.toISOString()
          });
          
        if (creditError) {
          console.error('Error crediting creator:', creditError);
          // We don't throw here to avoid failing the whole transaction
          // The platform got paid, but creator didn't - this should be handled by admin
        }
      }
    }
      
    // Check if auto-renewal threshold is reached
    await checkAutoRenewalThreshold(userId);
      
    return true;
  } catch (error) {
    console.error('Error in credit burn transaction:', error);
    return false;
  }
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
    
    const { data, error } = await supabase
      .from('credit_ledger')
      .insert({
        user_id: userId,
        amount,
        remaining: amount,
        source: type,  // We're using 'source' field to identify the bucket type
        stripe_payment_id: type === 'purchased' ? source : null,
        expires_at: expiresAt?.toISOString()
      })
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
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
    // Add credits with 30 days expiry
    await addCredits(
      userId, 
      bonusAmount, 
      'bonus', 
      'automation_bonus', 
      30 // 30 days expiry
    );
    
    // Instead of using a separate table for bonus tracking,
    // we'll log the allocation in a bonus_history table if needed later
    // For now, we just include it in our automation_webhooks table
    
    // Update the monthly_credit_burn field in automation_webhooks
    const { error } = await supabase
      .from('automation_webhooks')
      .update({ 
        monthly_credit_burn: monthlyBurn,
        last_triggered_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating automation webhook data:', error);
    }
  }
}

/**
 * Get credit breakdown by bucket type
 */
export async function getUserCreditBreakdown(userId: string): Promise<Record<CreditBucketType, number>> {
  // Don't try to load user-specific data if we don't have a real user ID
  if (!userId || userId === 'unknown') {
    return { purchased: 0, bonus: 0, referral: 0 }; // Default empty breakdown
  }
  
  const buckets = await getUserCreditBuckets(userId);
  
  return buckets.reduce((acc, bucket) => {
    const type = bucket.source as CreditBucketType;
    acc[type] = (acc[type] || 0) + bucket.remaining;
    return acc;
  }, { purchased: 0, bonus: 0, referral: 0 } as Record<CreditBucketType, number>);
}

/**
 * Get user's credit history (transactions)
 */
export async function getUserCreditHistory(userId: string, limit: number = 10, offset: number = 0) {
  // Don't try to load user-specific data if we don't have a real user ID
  if (!userId || userId === 'unknown') {
    return []; // Return empty history
  }
  
  // Get burns where the user is either the consumer or creator
  const { data: burns, error } = await supabase
    .from('credit_burns')
    .select(`
      *,
      user:user_id(*),
      creator:creator_id(*)
    `)
    .or(`user_id.eq.${userId},creator_id.eq.${userId}`)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching credit history:', error);
    return [];
  }
  
  return burns || [];
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