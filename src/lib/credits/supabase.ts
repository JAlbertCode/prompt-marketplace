import { createSupabaseServerClient } from '@/lib/supabase/server';

type CreditSource = 'purchase' | 'bonus' | 'referral';

// Get user's total credit balance from all buckets
export async function getUserTotalCredits(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('credit_ledger')
      .select('remaining')
      .eq('user_id', userId)
      .gt('remaining', 0);
    
    if (error) {
      console.error('Error fetching user credits:', error);
      return 0;
    }
    
    return data.reduce((total, bucket) => total + bucket.remaining, 0);
  } catch (error) {
    console.error('Error calculating user credits:', error);
    return 0;
  }
}

// Get user's credit breakdown by source
export async function getUserCreditBreakdown(userId: string) {
  if (!userId) return { purchased: 0, bonus: 0, referral: 0 };
  
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('credit_ledger')
      .select('source, remaining')
      .eq('user_id', userId)
      .gt('remaining', 0);
    
    if (error) {
      console.error('Error fetching user credit breakdown:', error);
      return { purchased: 0, bonus: 0, referral: 0 };
    }
    
    const breakdown = {
      purchased: 0,
      bonus: 0,
      referral: 0
    };
    
    data.forEach(bucket => {
      const source = bucket.source as CreditSource;
      breakdown[source] += bucket.remaining;
    });
    
    return breakdown;
  } catch (error) {
    console.error('Error calculating user credit breakdown:', error);
    return { purchased: 0, bonus: 0, referral: 0 };
  }
}

// Calculate 30-day credit burn from transaction history
export async function getUserMonthlyBurn(userId: string): Promise<number> {
  if (!userId) return 0;
  
  try {
    const supabase = createSupabaseServerClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('credit_burns')
      .select('credits_used')
      .eq('user_id', userId)
      .gte('timestamp', thirtyDaysAgo.toISOString());
    
    if (error) {
      console.error('Error fetching user monthly burn:', error);
      return 0;
    }
    
    return data.reduce((total, burn) => total + burn.credits_used, 0);
  } catch (error) {
    console.error('Error calculating user monthly burn:', error);
    return 0;
  }
}

// Get user's recent credit transactions (burns)
export async function getUserRecentTransactions(userId: string, limit = 10) {
  if (!userId) return [];
  
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('credit_burns')
      .select(`
        id,
        user_id,
        model_id,
        length,
        credits_used,
        timestamp,
        creator_id,
        creator_fee,
        prompt_id,
        flow_id,
        prompts (name),
        flows (name)
      `)
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user recent transactions:', error);
      return [];
    }
    
    return data.map(burn => ({
      id: burn.id,
      type: burn.flow_id ? 'flow' : 'prompt',
      name: burn.flow_id ? burn.flows?.name : burn.prompts?.name,
      model: burn.model_id,
      credits: burn.credits_used,
      time: new Date(burn.timestamp).toISOString(),
      timestamp: burn.timestamp
    }));
  } catch (error) {
    console.error('Error getting user recent transactions:', error);
    return [];
  }
}

// Get credit tier based on monthly burn
export function getCreditTier(monthlyBurn: number): string {
  if (monthlyBurn >= 1400000) return "Enterprise";
  if (monthlyBurn >= 600000) return "High Volume";
  if (monthlyBurn >= 300000) return "Medium Volume";
  if (monthlyBurn >= 100000) return "Low Volume";
  return "Standard";
}

// Calculate automation bonuses based on monthly burn
export function getAutomationBonus(monthlyBurn: number): number {
  if (monthlyBurn >= 1400000) return 400000;
  if (monthlyBurn >= 600000) return 100000;
  if (monthlyBurn >= 300000) return 40000;
  if (monthlyBurn >= 100000) return 10000;
  return 0;
}

// Format credits for display (e.g., 1,000,000 -> 1M)
export function formatCredits(credits: number): string {
  if (credits >= 1000000) {
    return `${(credits / 1000000).toFixed(credits % 1000000 === 0 ? 0 : 1)}M`;
  } else if (credits >= 1000) {
    return `${(credits / 1000).toFixed(credits % 1000 === 0 ? 0 : 1)}K`;
  } else {
    return credits.toString();
  }
}

// Convert credits to USD value
export function creditsToUsd(credits: number): number {
  return credits * 0.000001;
}

// Convert USD to credits
export function usdToCredits(usd: number): number {
  return Math.floor(usd * 1000000);
}
