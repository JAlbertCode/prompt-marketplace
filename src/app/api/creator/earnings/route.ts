import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);
    
    // Get the requested userId from query parameters
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
          { error: 'Forbidden - cannot view other creator stats' },
          { status: 403 }
        );
      }
      userId = requestedUserId;
    }
    
    // Calculate dates for different time periods
    const now = new Date();
    
    // Today - start of the current day
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // This week - start of the current week (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    weekStart.setHours(0, 0, 0, 0);
    
    // This month - start of the current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all credit transactions where user is the creator
    // These are positive transactions representing earnings
    const allEarnings = await prisma.creditTransaction.findMany({
      where: {
        creatorId: userId,
        type: 'CREATOR_PAYMENT',
      },
      include: {
        prompt: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get all prompt runs for this creator's prompts
    const promptRuns = await prisma.promptRun.findMany({
      where: {
        prompt: {
          creatorId: userId
        }
      },
      include: {
        prompt: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    // Calculate earnings by period
    const todayEarnings = allEarnings
      .filter(tx => tx.createdAt >= todayStart)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const weekEarnings = allEarnings
      .filter(tx => tx.createdAt >= weekStart)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const monthEarnings = allEarnings
      .filter(tx => tx.createdAt >= monthStart)
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const allTimeEarnings = allEarnings
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Get current pending amount in credit balance (not yet withdrawn or spent)
    const pendingAmount = await prisma.creditBucket.aggregate({
      where: {
        userId,
        type: 'bonus', // Creator earnings are added as bonus credits
        source: {
          startsWith: 'creator_payment'
        }
      },
      _sum: {
        remaining: true
      }
    });
    
    // Calculate earnings by prompt
    const earningsByPrompt = new Map<string, {
      promptId: string;
      promptTitle: string;
      totalRuns: number;
      totalEarnings: number;
    }>();
    
    // Process each earning transaction
    allEarnings.forEach(tx => {
      if (!tx.promptId) return;
      
      const promptId = tx.promptId;
      const promptTitle = tx.prompt?.title || 'Unknown Prompt';
      
      const existing = earningsByPrompt.get(promptId) || {
        promptId,
        promptTitle,
        totalRuns: 0,
        totalEarnings: 0
      };
      
      // Update total earnings
      existing.totalEarnings += tx.amount;
      
      // Save back to map
      earningsByPrompt.set(promptId, existing);
    });
    
    // Process prompt runs to count total executions
    promptRuns.forEach(run => {
      if (!run.promptId) return;
      
      const promptId = run.promptId;
      const promptTitle = run.prompt?.title || 'Unknown Prompt';
      
      const existing = earningsByPrompt.get(promptId) || {
        promptId,
        promptTitle,
        totalRuns: 0,
        totalEarnings: 0
      };
      
      // Increment run count
      existing.totalRuns += 1;
      
      // Save back to map
      earningsByPrompt.set(promptId, existing);
    });
    
    // Convert map to array and sort by earnings (highest first)
    const sortedPrompts = Array.from(earningsByPrompt.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .map(prompt => ({
        ...prompt,
        percentageOfTotal: Math.round((prompt.totalEarnings / allTimeEarnings) * 100) || 0
      }));
    
    // Get count of unique users who have used the creator's prompts
    const uniqueUsers = new Set();
    promptRuns.forEach(run => {
      if (run.userId) {
        uniqueUsers.add(run.userId);
      }
    });
    
    // Construct response object
    const response = {
      byPrompt: sortedPrompts,
      byPeriod: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        allTime: allTimeEarnings
      },
      pendingPayout: pendingAmount._sum.remaining || 0,
      totalUsers: uniqueUsers.size
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching creator earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator earnings' },
      { status: 500 }
    );
  }
}