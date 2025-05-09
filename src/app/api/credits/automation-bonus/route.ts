import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addAutomationBonus } from '@/lib/credits';

/**
 * POST /api/credits/automation-bonus
 * 
 * Calculate and issue monthly automation bonuses for users
 * This endpoint is designed to be called by a cron job or manually by admins
 * It calculates usage for the past 30 days and issues bonuses accordingly
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the date range for the past 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Find all users with n8n automation usage in the past 30 days
    // This is determined by checking for credit transactions with n8n API source
    const automationUsers = await prisma.creditTransaction.groupBy({
      by: ['userId'],
      where: {
        type: 'PROMPT_RUN',
        source: 'n8n_api',
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      },
      _sum: {
        amount: true
      },
      having: {
        amount: {
          _sum: {
            lt: 0 // Credits consumed will be negative values
          }
        }
      }
    });
    
    // Process each user and issue bonuses if qualified
    const results = await Promise.all(
      automationUsers.map(async (user) => {
        // Convert negative amount to positive for calculation
        const monthlyBurn = Math.abs(user._sum.amount || 0);
        
        if (monthlyBurn >= 100000) { // Minimum 100K monthly burn to qualify
          // Issue automation bonus based on tier
          await addAutomationBonus(user.userId, monthlyBurn);
          
          return {
            userId: user.userId,
            monthlyBurn,
            success: true
          };
        }
        
        return {
          userId: user.userId,
          monthlyBurn,
          success: false,
          reason: 'Below minimum qualification threshold'
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      bonusesIssued: results.filter(r => r.success).length,
      details: results
    });
  } catch (error) {
    console.error('Error processing automation bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to process automation bonuses' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/credits/automation-bonus
 * 
 * Get all users who qualify for automation bonuses
 * This can be used by admins to see who would qualify before issuing bonuses
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the date range for the past 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Find all users with n8n automation usage in the past 30 days
    const automationUsers = await prisma.creditTransaction.groupBy({
      by: ['userId'],
      where: {
        type: 'PROMPT_RUN',
        source: 'n8n_api',
        createdAt: {
          gte: thirtyDaysAgo,
          lte: now
        }
      },
      _sum: {
        amount: true
      },
      having: {
        amount: {
          _sum: {
            lt: 0 // Credits consumed will be negative values
          }
        }
      }
    });
    
    // Process each user to determine eligible bonus
    const eligibleUsers = await Promise.all(
      automationUsers.map(async (user) => {
        // Convert negative amount to positive for calculation
        const monthlyBurn = Math.abs(user._sum.amount || 0);
        
        // Get user details
        const userDetails = await prisma.user.findUnique({
          where: { id: user.userId },
          select: {
            id: true,
            name: true,
            email: true
          }
        });
        
        // Calculate bonus tier
        let bonusAmount = 0;
        let tier = 'none';
        
        if (monthlyBurn >= 1400000) { // ≥1.4M
          bonusAmount = 400000;
          tier = 'enterprise';
        } else if (monthlyBurn >= 600000) { // ≥600K
          bonusAmount = 100000;
          tier = 'high';
        } else if (monthlyBurn >= 300000) { // ≥300K
          bonusAmount = 40000;
          tier = 'medium';
        } else if (monthlyBurn >= 100000) { // ≥100K
          bonusAmount = 10000;
          tier = 'low';
        }
        
        return {
          user: userDetails,
          monthlyBurn,
          eligible: monthlyBurn >= 100000,
          bonusTier: tier,
          bonusAmount
        };
      })
    );
    
    // Filter out only eligible users
    const qualifiedUsers = eligibleUsers.filter(user => user.eligible);
    
    return NextResponse.json({
      totalUsers: automationUsers.length,
      qualifiedUsers: qualifiedUsers.length,
      summary: {
        enterprise: qualifiedUsers.filter(u => u.bonusTier === 'enterprise').length,
        high: qualifiedUsers.filter(u => u.bonusTier === 'high').length,
        medium: qualifiedUsers.filter(u => u.bonusTier === 'medium').length,
        low: qualifiedUsers.filter(u => u.bonusTier === 'low').length
      },
      users: qualifiedUsers
    });
  } catch (error) {
    console.error('Error fetching automation bonus eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automation bonus eligibility' },
      { status: 500 }
    );
  }
}