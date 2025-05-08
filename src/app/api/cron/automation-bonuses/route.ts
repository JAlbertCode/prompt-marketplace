import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { addAutomationBonus } from '@/lib/credits';

/**
 * Monthly Automation Bonuses Cron Job
 * Runs on the 1st of each month to:
 * 1. Calculate previous month's usage for each user
 * 2. Award automation bonuses based on usage tiers
 */
export async function GET() {
  try {
    // Calculate the date range for the previous month
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Get all users with automation usage in the previous month
    const userTransactions = await prisma.creditTransaction.groupBy({
      by: ['userId'],
      where: {
        // Only look at transactions from previous month
        createdAt: {
          gte: firstDayOfPreviousMonth,
          lt: firstDayOfCurrentMonth,
        },
        // Only include automated/webhook runs
        type: {
          in: ['webhook_run', 'automation_run', 'api_run'],
        },
      },
      _sum: {
        creditsUsed: true,
      },
    });
    
    // Track results
    const results = {
      processedUsers: 0,
      bonusesAwarded: 0,
      totalBonusCredits: 0,
      errors: [] as string[],
    };
    
    // Process each user's usage
    for (const userStat of userTransactions) {
      results.processedUsers++;
      
      try {
        const userId = userStat.userId;
        const monthlyBurn = userStat._sum.creditsUsed || 0;
        
        // Skip users with low usage
        if (monthlyBurn < 100000) continue;
        
        // Calculate and add the appropriate automation bonus
        let bonusAmount = 0;
        
        // Determine bonus tier based on monthly burn
        if (monthlyBurn >= 1400000) {
          bonusAmount = 400000; // Auto-enterprise tier
        } else if (monthlyBurn >= 600000) {
          bonusAmount = 100000;
        } else if (monthlyBurn >= 300000) {
          bonusAmount = 40000;
        } else if (monthlyBurn >= 100000) {
          bonusAmount = 10000;
        }
        
        if (bonusAmount > 0) {
          // Award the bonus
          await addAutomationBonus(userId, monthlyBurn);
          
          results.bonusesAwarded++;
          results.totalBonusCredits += bonusAmount;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error processing user ${userStat.userId}: ${errorMessage}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Automation bonuses error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Vercel cron jobs require this header
export const config = {
  runtime: 'edge',
};
