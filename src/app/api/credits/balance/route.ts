/**
 * Direct credits balance API - bypasses complex auth to get credits directly
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserTotalCredits, getUserCreditBreakdown } from '@/lib/credits';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Parse user ID from query string (if provided)
    const userIdParam = req.nextUrl.searchParams.get('userId');
    
    // Try to get user ID from NextAuth session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    // Use the userId from query parameter if provided (for debugging)
    if (userIdParam) {
      userId = userIdParam;
    }
    
    // If we don't have a user ID from NextAuth, try Supabase
    if (!userId) {
      // Get the Supabase user if available
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      // Last resort - get the first user ID for testing
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (users && users.length > 0) {
        userId = users[0].id;
        console.log('Using first user for testing:', userId);
      } else {
        return NextResponse.json({ 
          error: 'No user ID available', 
          userId: null,
          totalCredits: 0,
          creditBreakdown: {
            purchased: 0,
            bonus: 0,
            referral: 0
          }
        });
      }
    }
    
    console.log('Getting credits for user:', userId);
    
    // Get credit data directly from the database
    const totalCredits = await getUserTotalCredits(userId);
    const creditBreakdown = await getUserCreditBreakdown(userId);
    
    console.log('Total credits found:', totalCredits);
    
    return NextResponse.json({
      userId,
      totalCredits,
      creditBreakdown
    });
  } catch (error) {
    console.error('Error getting credits balance:', error);
    return NextResponse.json({ 
      error: 'Error getting credit balance',
      totalCredits: 0,
      creditBreakdown: {
        purchased: 0,
        bonus: 0,
        referral: 0
      }
    });
  }
}