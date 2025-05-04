import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  getUserTotalCredits, 
  getUserCreditBreakdown, 
  getUserCreditHistory 
} from '@/lib/credits';

/**
 * GET /api/credits
 * 
 * Get credit information for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get total credits
    const totalCredits = await getUserTotalCredits(userId);
    
    // Get credit breakdown
    const creditBreakdown = await getUserCreditBreakdown(userId);
    
    // Get recent transactions (last 5)
    const recentTransactions = await getUserCreditHistory(userId, 5);
    
    return NextResponse.json({
      totalCredits,
      creditBreakdown,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit information' },
      { status: 500 }
    );
  }
}