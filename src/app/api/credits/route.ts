/**
 * API route for getting user's credit balance and breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserTotalCredits, 
  getUserCreditBreakdown, 
  getUserCreditHistory 
} from '@/lib/credits';
import { checkServerAuth } from '@/lib/auth/helpers/serverAuth';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Check authentication using our helper
    const { isAuthenticated, userId } = await checkServerAuth();
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Handle the case where userId is 'unknown' (from Supabase auth)
    let actualUserId = userId;
    
    if (userId === 'unknown') {
      try {
        // Use the Supabase helper for server components that properly handles cookies
        const cookieStore = cookies();
        const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
        
        // Get the user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Supabase auth error:', error);
          return NextResponse.json({ 
            error: 'User not authenticated with Supabase', 
            details: error?.message 
          }, { status: 401 });
        }
        
        actualUserId = user.id;
        console.log('Supabase user ID found:', actualUserId);
      } catch (authError) {
        console.error('Error authenticating with Supabase:', authError);
        return NextResponse.json({ 
          error: 'Error authenticating with Supabase', 
          details: authError instanceof Error ? authError.message : String(authError) 
        }, { status: 500 });
      }
    }
    
    if (!actualUserId) {
      return NextResponse.json({ error: 'Unable to determine user ID' }, { status: 400 });
    }
    
    // Debug log
    console.log('Fetching credits for user:', actualUserId);
    
    // Get user's total credits
    const totalCredits = await getUserTotalCredits(actualUserId);
    
    // Debug log
    console.log('Total credits found:', totalCredits);
    
    // Get credit breakdown by bucket type
    const creditBreakdown = await getUserCreditBreakdown(actualUserId);
    
    // Get recent transactions
    const recentTransactions = await getUserCreditHistory(actualUserId, 5, 0);
    
    return NextResponse.json({
      success: true,
      totalCredits,
      creditBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to get credit balance', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
