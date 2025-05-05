import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getModelById } from '@/lib/models/modelRegistry';

export async function GET(req: NextRequest) {
  try {
    // Get the session for authentication
    const session = await getServerSession(authOptions);
    
    // Extract query parameters
    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get('userId');
    const period = url.searchParams.get('period') || 'month';
    
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
    
    // Calculate the date range based on the period
    const now = new Date();
    let startDate: Date;
    let periodLabel: string;
    
    switch(period) {
      case 'week':
        // Start from the beginning of the current week (Sunday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        periodLabel = 'This Week';
        break;
      
      case 'year':
        // Start from January 1st of the current year
        startDate = new Date(now.getFullYear(), 0, 1);
        periodLabel = 'This Year';
        break;
      
      case 'month':
      default:
        // Start from the 1st of the current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = 'This Month';
        break;
    }
    
    // Query credit transactions for the specified period
    // We specifically look for negative amounts (credits spent)
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: now
        },
        // Get only transactions where credits were spent (negative amounts)
        amount: {
          lt: 0
        }
      },
      select: {
        id: true,
        modelId: true,
        amount: true,
        createdAt: true
      }
    });
    
    // No transactions for this period
    if (transactions.length === 0) {
      return NextResponse.json({
        modelUsage: [],
        totalUsage: 0,
        periodLabel
      });
    }
    
    // Group transactions by model
    const modelUsageMap = new Map<string, number>();
    let totalUsage = 0;
    
    transactions.forEach(tx => {
      // Convert negative amount to positive
      const amount = Math.abs(tx.amount);
      totalUsage += amount;
      
      // Add to model map
      const currentAmount = modelUsageMap.get(tx.modelId) || 0;
      modelUsageMap.set(tx.modelId, currentAmount + amount);
    });
    
    // Convert map to array and sort by usage (highest first)
    const modelUsage = Array.from(modelUsageMap.entries())
      .map(([modelId, credits]) => {
        // Get model details
        const model = getModelById(modelId);
        
        return {
          modelId,
          // Use model display name if available, otherwise use ID
          displayName: model?.displayName || modelId,
          credits,
          percentage: Math.round((credits / totalUsage) * 100),
          provider: model?.provider || 'unknown'
        };
      })
      .sort((a, b) => b.credits - a.credits);
    
    return NextResponse.json({
      modelUsage,
      totalUsage,
      periodLabel
    });
  } catch (error) {
    console.error('Error fetching credit usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit usage data' },
      { status: 500 }
    );
  }
}