/**
 * API route for getting user's credit balance and breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getUserTotalCredits, 
  getUserCreditBreakdown, 
  getUserCreditHistory 
} from '@/lib/credits';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user's total credits
    const totalCredits = await getUserTotalCredits(userId);
    
    // Get credit breakdown by bucket type
    const creditBreakdown = await getUserCreditBreakdown(userId);
    
    // Get recent transactions
    const recentTransactions = await getUserCreditHistory(userId, 5, 0);
    
    return NextResponse.json({
      success: true,
      totalCredits,
      creditBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to get credit balance' },
      { status: 500 }
    );
  }
}
