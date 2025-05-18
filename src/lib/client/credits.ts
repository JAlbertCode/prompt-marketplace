'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Direct client-side credit display functionality
 * Bypasses authentication middleware by directly querying Supabase
 */

// Initialize a client-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch a user's credits directly from the database
 * Client-side implementation for displaying UI
 */
export async function fetchUserCredits(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    console.log('Directly fetching credits for user:', userId);
    
    // Query the database directly
    const { data: creditBuckets, error } = await supabase
      .from('credit_ledger')
      .select('remaining')
      .eq('user_id', userId)
      .gt('remaining', 0)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    
    if (error) {
      console.error('Error in direct credit fetch:', error);
      return 0;
    }
    
    // Sum the remaining credits
    const total = creditBuckets?.reduce((sum, bucket) => sum + bucket.remaining, 0) || 0;
    console.log('Direct credit query found:', total, 'credits');
    
    return total;
  } catch (error) {
    console.error('Exception in direct credit fetch:', error);
    return 0;
  }
}

/**
 * Get credit breakdown by bucket type
 */
export async function fetchUserCreditBreakdown(userId: string) {
  if (!userId) {
    return { purchased: 0, bonus: 0, referral: 0 };
  }
  
  try {
    // Fetch credit buckets
    const { data: buckets, error } = await supabase
      .from('credit_ledger')
      .select('source, remaining')
      .eq('user_id', userId)
      .gt('remaining', 0)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    
    if (error) {
      console.error('Error fetching credit breakdown:', error);
      return { purchased: 0, bonus: 0, referral: 0 };
    }
    
    // Sum credits by type
    return buckets?.reduce((acc, bucket) => {
      const type = bucket.source;
      if (type === 'purchased' || type === 'bonus' || type === 'referral') {
        acc[type] = (acc[type] || 0) + bucket.remaining;
      }
      return acc;
    }, { purchased: 0, bonus: 0, referral: 0 }) || { purchased: 0, bonus: 0, referral: 0 };
  } catch (error) {
    console.error('Exception fetching credit breakdown:', error);
    return { purchased: 0, bonus: 0, referral: 0 };
  }
}

/**
 * Get recent credit transactions
 */
export async function fetchRecentTransactions(userId: string, limit = 5) {
  if (!userId) return [];
  
  try {
    // Get burns where the user is either the consumer or creator
    const { data: burns, error } = await supabase
      .from('credit_burns')
      .select('*')
      .or(`user_id.eq.${userId},creator_id.eq.${userId}`)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
    
    return burns || [];
  } catch (error) {
    console.error('Exception fetching transaction history:', error);
    return [];
  }
}