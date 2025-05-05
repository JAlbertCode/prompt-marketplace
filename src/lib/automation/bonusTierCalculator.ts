/**
 * Bonus Tier Calculator
 * 
 * This utility helps determine automation bonus eligibility and provides information
 * about upcoming tier changes based on usage patterns.
 */

import { prisma } from '@/lib/db';

// Define bonus tiers based on monthly usage
export const AUTOMATION_BONUS_TIERS = [
  {
    id: 'low',
    name: 'Low Tier',
    minBurn: 100_000,
    maxBurn: 299_999,
    bonus: 10_000,
    description: 'Low-volume automation'
  },
  {
    id: 'medium',
    name: 'Medium Tier',
    minBurn: 300_000,
    maxBurn: 599_999,
    bonus: 40_000,
    description: 'Medium-volume automation'
  },
  {
    id: 'high',
    name: 'High Tier',
    minBurn: 600_000,
    maxBurn: 1_399_999,
    bonus: 100_000,
    description: 'High-volume automation'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Tier',
    minBurn: 1_400_000,
    maxBurn: Number.MAX_SAFE_INTEGER,
    bonus: 400_000,
    description: 'Enterprise-level automation (auto-enterprise)'
  }
];

/**
 * Calculate current tier and next tier information based on usage
 * @param userId User ID
 * @param days Number of days to look back for usage calculation
 * @returns Tier info with progress and projections
 */
export async function calculateAutomationTier(userId: string, days: number = 30) {
  try {
    // Get the date range
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Get total credit burn for the user during this period
    // Specifically looking for transactions tagged as coming from n8n
    const txSummary = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        source: 'n8n_api',
        createdAt: {
          gte: startDate,
          lte: now
        },
        // Credits burned are stored as negative values
        amount: {
          lt: 0
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Convert to positive burn amount
    const monthlyBurn = Math.abs(txSummary._sum.amount || 0);
    
    // Determine current tier
    let currentTier = null;
    let nextTier = null;
    
    for (const tier of AUTOMATION_BONUS_TIERS) {
      if (monthlyBurn >= tier.minBurn && monthlyBurn <= tier.maxBurn) {
        currentTier = tier;
        // Find next tier
        const tierIndex = AUTOMATION_BONUS_TIERS.findIndex(t => t.id === tier.id);
        if (tierIndex < AUTOMATION_BONUS_TIERS.length - 1) {
          nextTier = AUTOMATION_BONUS_TIERS[tierIndex + 1];
        }
        break;
      }
    }
    
    // If not in any tier yet but has some usage, set next tier as the lowest
    if (!currentTier && monthlyBurn > 0) {
      nextTier = AUTOMATION_BONUS_TIERS[0];
    }
    
    // Calculate progress toward next tier
    let progress = 0;
    let creditsToNextTier = 0;
    
    if (nextTier) {
      if (currentTier) {
        // Calculate progress from min of current tier to min of next tier
        const range = nextTier.minBurn - currentTier.minBurn;
        const position = monthlyBurn - currentTier.minBurn;
        progress = Math.min(100, Math.round((position / range) * 100));
        creditsToNextTier = nextTier.minBurn - monthlyBurn;
      } else {
        // Progress from 0 to min of first tier
        progress = Math.min(100, Math.round((monthlyBurn / nextTier.minBurn) * 100));
        creditsToNextTier = nextTier.minBurn - monthlyBurn;
      }
    } else if (currentTier) {
      // Already at highest tier
      progress = 100;
      creditsToNextTier = 0;
    }
    
    // Calculate daily rate
    const dailyRate = days > 0 ? Math.round(monthlyBurn / days) : 0;
    
    // Project time to next tier
    const daysToNextTier = dailyRate > 0 && creditsToNextTier > 0 
      ? Math.ceil(creditsToNextTier / dailyRate)
      : null;
    
    return {
      monthlyBurn,
      dailyRate,
      currentTier,
      nextTier,
      progress,
      creditsToNextTier,
      daysToNextTier,
      projectedBonusChange: nextTier ? nextTier.bonus - (currentTier?.bonus || 0) : 0
    };
  } catch (error) {
    console.error('Error calculating automation tier:', error);
    return null;
  }
}

/**
 * Check if a user has received their bonus for the current period
 * @param userId User ID
 * @returns Boolean indicating if bonus has been issued
 */
export async function hasReceivedCurrentBonus(userId: string) {
  // Get the first day of the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Check for any automation bonus issued this month
  const recentBonus = await prisma.creditBonus.findFirst({
    where: {
      userId,
      reason: 'automation_monthly',
      createdAt: {
        gte: firstDayOfMonth
      }
    }
  });
  
  return recentBonus !== null;
}

/**
 * Get usage statistics for n8n automation
 * @param userId User ID
 * @param days Number of days to look back
 * @returns Usage statistics
 */
export async function getAutomationUsageStats(userId: string, days: number = 30) {
  try {
    // Get the date range
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Get total credit burn per day
    const dailyBurn = await prisma.creditTransaction.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        source: 'n8n_api',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get usage by model
    const modelUsage = await prisma.creditTransaction.groupBy({
      by: ['modelId'],
      where: {
        userId,
        source: 'n8n_api',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total executions
    const totalExecutions = await prisma.creditTransaction.count({
      where: {
        userId,
        source: 'n8n_api',
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    });
    
    // Get bonuses received in this period
    const bonuses = await prisma.creditBonus.findMany({
      where: {
        userId,
        reason: 'automation_monthly',
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    });
    
    return {
      dailyBurn: dailyBurn.map(day => ({
        date: day.createdAt,
        burn: Math.abs(day._sum.amount || 0)
      })),
      modelUsage: modelUsage.map(model => ({
        modelId: model.modelId,
        burn: Math.abs(model._sum.amount || 0)
      })),
      totalExecutions,
      bonuses,
      totalBurn: dailyBurn.reduce((total, day) => total + Math.abs(day._sum.amount || 0), 0),
      totalBonusReceived: bonuses.reduce((total, bonus) => total + bonus.amount, 0)
    };
  } catch (error) {
    console.error('Error getting automation usage stats:', error);
    return null;
  }
}