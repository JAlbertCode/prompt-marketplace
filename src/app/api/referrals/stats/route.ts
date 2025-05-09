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
          { error: 'Forbidden - cannot view other user referral stats' },
          { status: 403 }
        );
      }
      userId = requestedUserId;
    }
    
    // Get user's referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });
    
    // If user doesn't have a referral code, generate one
    let referralCode = user?.referralCode;
    if (!referralCode) {
      // Generate a unique referral code
      referralCode = generateReferralCode();
      
      // Save the referral code to the user
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode }
      });
    }
    
    // Get all users referred by this user
    const referrals = await prisma.user.findMany({
      where: { referredBy: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        referralQualified: true,
        referralCreditsAwarded: true,
        creditTransactions: {
          // Get the sum of credits spent by this user
          select: {
            amount: true
          },
          where: {
            amount: { lt: 0 } // Only count negative transactions (spending)
          }
        }
      }
    });
    
    // Get referral configuration to check qualification threshold
    let minSpendRequirement = 10000; // Default value
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: 'referralProgram' }
      });
      
      if (config?.value) {
        const parsedConfig = JSON.parse(config.value);
        minSpendRequirement = parsedConfig.minSpendRequirement || minSpendRequirement;
      }
    } catch (error) {
      console.error('Error fetching referral config:', error);
    }
    
    // Process referrals data
    const referralsData = referrals.map(referral => {
      // Calculate total spent by this user (convert negative transactions to positive amounts)
      const totalSpent = referral.creditTransactions.reduce(
        (sum, tx) => sum + Math.abs(tx.amount), 0
      );
      
      // Determine if the referral is complete or still pending
      // A referral is complete if it's marked as qualified or has spent enough credits
      const isQualified = referral.referralQualified || totalSpent >= minSpendRequirement;
      
      return {
        id: referral.id,
        name: referral.name || 'Anonymous User',
        email: referral.email || '',
        status: isQualified ? 'complete' : 'pending',
        creditsEarned: referral.referralCreditsAwarded || 0,
        dateJoined: referral.createdAt.toISOString(),
        totalSpent
      };
    });
    
    // Calculate total credits earned from referrals
    const creditsEarned = await prisma.creditBucket.aggregate({
      where: {
        userId,
        source: 'referral_bonus'
      },
      _sum: {
        amount: true
      }
    });
    
    // Count pending vs. completed referrals
    const pendingCount = referralsData.filter(r => r.status === 'pending').length;
    const totalCount = referralsData.length;
    
    // Construct response object
    const response = {
      referralCode,
      totalReferrals: totalCount,
      pendingReferrals: pendingCount,
      creditsEarned: creditsEarned._sum.amount || 0,
      referralsData
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral statistics' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate a random referral code
 * Format: 8 alphanumeric characters (e.g., AB12CD34)
 */
function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Create 8-character code
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  
  return code;
}