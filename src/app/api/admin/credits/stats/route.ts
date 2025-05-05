import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Get current date boundaries
    const now = new Date();
    
    // Start of today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    // Start of this month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get total credits across all users
    const totalCreditBuckets = await prisma.creditBucket.aggregate({
      _sum: {
        remaining: true
      }
    });
    
    // Get credits by type
    const purchasedCredits = await prisma.creditBucket.aggregate({
      where: { type: 'purchased' },
      _sum: {
        remaining: true
      }
    });
    
    const bonusCredits = await prisma.creditBucket.aggregate({
      where: { type: 'bonus' },
      _sum: {
        remaining: true
      }
    });
    
    const referralCredits = await prisma.creditBucket.aggregate({
      where: { type: 'referral' },
      _sum: {
        remaining: true
      }
    });
    
    // Get credits used today
    const creditsUsedToday = await prisma.creditTransaction.aggregate({
      where: {
        createdAt: {
          gte: todayStart
        },
        // Only count negative amounts (credits spent)
        amount: {
          lt: 0
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get credits used this month
    const creditsUsedThisMonth = await prisma.creditTransaction.aggregate({
      where: {
        createdAt: {
          gte: monthStart
        },
        // Only count negative amounts (credits spent)
        amount: {
          lt: 0
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Convert these to array of model usage objects
    const rawModelUsage = await prisma.$queryRaw`
      SELECT 
        "modelId", 
        ABS(SUM(amount)) as "creditsBurned"
      FROM "CreditTransaction"
      WHERE amount < 0
      GROUP BY "modelId"
      ORDER BY "creditsBurned" DESC
    `;
    
    // Calculate percentages and get model names
    const totalBurned = Math.abs(creditsUsedThisMonth._sum.amount || 0);
    
    // Get all model information
    const models = await prisma.model.findMany({
      select: {
        id: true,
        displayName: true
      }
    });
    
    // Create a model name lookup map
    const modelNameMap = new Map<string, string>();
    models.forEach(model => {
      modelNameMap.set(model.id, model.displayName);
    });
    
    // Format the model usage data
    const modelUsage = (rawModelUsage as any[]).map(usage => ({
      modelId: usage.modelId,
      displayName: modelNameMap.get(usage.modelId) || usage.modelId,
      creditsBurned: Number(usage.creditsBurned),
      percentageOfTotal: Math.round((Number(usage.creditsBurned) / totalBurned) * 100) || 0
    }));
    
    // Calculate revenue
    // 1,000,000 credits = $1
    const revenueToday = Math.abs(creditsUsedToday._sum.amount || 0) / 1_000_000;
    const revenueThisMonth = Math.abs(creditsUsedThisMonth._sum.amount || 0) / 1_000_000;
    
    // Get all-time revenue
    const allTimeCredits = await prisma.creditTransaction.aggregate({
      where: {
        // Credit purchases are recorded as positive transactions
        type: 'CREDIT_PURCHASE'
      },
      _sum: {
        amount: true
      }
    });
    
    const revenueAllTime = (allTimeCredits._sum.amount || 0) / 1_000_000;
    
    // Get daily usage for the past 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const rawDailyUsage = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as "date", 
        ABS(SUM(amount)) as "credits"
      FROM "CreditTransaction"
      WHERE 
        amount < 0 AND
        "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY "date" ASC
    `;
    
    const dailyUsage = (rawDailyUsage as any[]).map(day => ({
      date: day.date.toISOString().split('T')[0],
      credits: Number(day.credits)
    }));
    
    // Construct the response object
    const stats = {
      totalUsers,
      totalCredits: totalCreditBuckets._sum.remaining || 0,
      creditsUsedToday: Math.abs(creditsUsedToday._sum.amount || 0),
      creditsUsedThisMonth: Math.abs(creditsUsedThisMonth._sum.amount || 0),
      purchasedCredits: purchasedCredits._sum.remaining || 0,
      bonusCredits: bonusCredits._sum.remaining || 0,
      referralCredits: referralCredits._sum.remaining || 0,
      modelUsage,
      dailyUsage,
      revenue: {
        today: revenueToday,
        thisMonth: revenueThisMonth,
        allTime: revenueAllTime
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching credit system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit system statistics' },
      { status: 500 }
    );
  }
}