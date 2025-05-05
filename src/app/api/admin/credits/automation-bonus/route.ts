import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateAutomationTier, AUTOMATION_BONUS_TIERS } from '@/lib/automation/bonusTierCalculator';
import { addCredits } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Get all users who have used n8n automation
    const automationUsers = await prisma.creditTransaction.groupBy({
      by: ['userId'],
      where: {
        source: 'n8n_api',
        // Look at transactions in the past 30 days
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        // Only look at credit burns (negative amounts)
        amount: {
          lt: 0
        }
      },
      _sum: {
        amount: true
      },
      having: {
        amount: {
          _sum: {
            lt: 0 // Must have at least some negative amount (credits spent)
          }
        }
      }
    });
    
    // Check which users qualify for bonuses
    const results = [];
    let bonusesIssued = 0;
    
    for (const userRecord of automationUsers) {
      const userId = userRecord.userId;
      const usage = Math.abs(userRecord._sum.amount || 0);
      
      // Check if this user has already received a bonus this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const existingBonus = await prisma.creditBonus.findFirst({
        where: {
          userId,
          reason: 'automation_monthly',
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      });
      
      if (existingBonus) {
        results.push({
          userId,
          usage,
          status: 'skipped',
          reason: 'Already received bonus this month'
        });
        continue;
      }
      
      // Calculate their tier based on usage
      let qualifyingTier = null;
      
      for (const tier of AUTOMATION_BONUS_TIERS) {
        if (usage >= tier.minBurn && usage <= tier.maxBurn) {
          qualifyingTier = tier;
          break;
        }
      }
      
      if (!qualifyingTier) {
        results.push({
          userId,
          usage,
          status: 'skipped',
          reason: 'Usage does not qualify for any automation tier'
        });
        continue;
      }
      
      // Award bonus based on the tier
      const bonusAmount = qualifyingTier.bonus;
      
      // Add bonus credits to the user's account
      await addCredits(
        userId,
        bonusAmount,
        'bonus',
        `automation_bonus:${qualifyingTier.id}`,
        30 // 30 days expiry
      );
      
      // Record the bonus
      await prisma.creditBonus.create({
        data: {
          userId,
          amount: bonusAmount,
          reason: 'automation_monthly',
          tier: qualifyingTier.id,
          monthlyBurn: usage
        }
      });
      
      // Add to results
      results.push({
        userId,
        usage,
        status: 'awarded',
        tier: qualifyingTier.id,
        bonusAmount
      });
      
      bonusesIssued++;
    }
    
    // Return success response with summary
    return NextResponse.json({
      success: true,
      totalUsers: automationUsers.length,
      bonusesIssued,
      results
    });
  } catch (error) {
    console.error('Error calculating automation bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to calculate automation bonuses' },
      { status: 500 }
    );
  }
}