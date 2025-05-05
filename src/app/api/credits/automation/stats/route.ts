import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  calculateAutomationTier, 
  getAutomationUsageStats,
  hasReceivedCurrentBonus
} from '@/lib/automation/bonusTierCalculator';

export async function GET(req: NextRequest) {
  try {
    // Get the session for authentication
    const session = await getServerSession(authOptions);
    
    // Get the requested userId from the query parameters
    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get('userId');
    
    // Ensure authentication - user must be logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Determine which user ID to use
    // Only admins can view stats for other users
    let userId = session.user.id;
    if (requestedUserId && requestedUserId !== userId) {
      const isAdmin = session.user.role === 'ADMIN';
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden - cannot view other user stats' },
          { status: 403 }
        );
      }
      userId = requestedUserId;
    }
    
    // Calculate the automation tier info
    const tierInfo = await calculateAutomationTier(userId, 30); // Last 30 days
    
    // Get additional usage stats
    const usageStats = await getAutomationUsageStats(userId, 30);
    
    // Check if user has received their bonus for the current month
    const hasBonus = await hasReceivedCurrentBonus(userId);
    
    // Return all the stats
    return NextResponse.json({
      ...tierInfo,
      ...usageStats,
      hasReceivedCurrentBonus: hasBonus
    });
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation statistics' },
      { status: 500 }
    );
  }
}