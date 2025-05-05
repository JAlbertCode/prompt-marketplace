/**
 * Referral Program Processor
 * 
 * This module handles processing referrals and awarding credits to both
 * the referrer and the invitee based on the referral program rules.
 */

import { prisma } from '@/lib/db';
import { addCredits } from '@/lib/credits';

// Default configuration in case database settings are unavailable
const DEFAULT_REFERRAL_CONFIG = {
  inviterBonus: 50000, // 50,000 credits per successful referral
  inviteeBonus: 20000, // 20,000 credits for new users
  minSpendRequirement: 10000, // Minimum credits spent by referral to qualify
};

/**
 * Get current referral program configuration
 */
export async function getReferralConfig() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: {
        key: 'referralProgram'
      }
    });
    
    if (config?.value) {
      try {
        const parsedConfig = JSON.parse(config.value);
        return {
          ...DEFAULT_REFERRAL_CONFIG,
          ...parsedConfig
        };
      } catch (e) {
        console.error('Error parsing referral config:', e);
      }
    }
    
    return DEFAULT_REFERRAL_CONFIG;
  } catch (error) {
    console.error('Error fetching referral configuration:', error);
    return DEFAULT_REFERRAL_CONFIG;
  }
}

/**
 * Process a new user signup with a referral code
 * Awards welcome credits to the new user
 * 
 * @param newUserId ID of the newly registered user
 * @param referralCode Referral code used during signup
 * @returns Success status and information about the awarded credits
 */
export async function processNewUserSignup(newUserId: string, referralCode?: string) {
  // Get referral program config
  const config = await getReferralConfig();
  
  // Initialize result object
  const result = {
    success: true,
    creditsAwarded: 0,
    referrer: null as { id: string; name: string } | null,
    message: ''
  };
  
  // Start database transaction
  return await prisma.$transaction(async (tx) => {
    // Find the new user
    const newUser = await tx.user.findUnique({
      where: { id: newUserId },
      select: { id: true, name: true, email: true, referredBy: true }
    });
    
    if (!newUser) {
      result.success = false;
      result.message = 'User not found';
      return result;
    }
    
    // If user already has a referrer, don't process again
    if (newUser.referredBy) {
      // Add standard welcome bonus regardless
      await addStandardWelcomeBonus(newUserId, config.inviteeBonus);
      
      result.creditsAwarded = config.inviteeBonus;
      result.message = 'Referral already processed, welcome bonus added';
      return result;
    }
    
    // If no referral code was provided, just add standard welcome bonus
    if (!referralCode) {
      await addStandardWelcomeBonus(newUserId, config.inviteeBonus);
      
      result.creditsAwarded = config.inviteeBonus;
      result.message = 'No referral code provided, welcome bonus added';
      return result;
    }
    
    // Find the referrer using the provided code
    const referrer = await tx.user.findFirst({
      where: { referralCode },
      select: { id: true, name: true }
    });
    
    // If referrer not found, just add standard welcome bonus
    if (!referrer) {
      await addStandardWelcomeBonus(newUserId, config.inviteeBonus);
      
      result.creditsAwarded = config.inviteeBonus;
      result.message = 'Invalid referral code, welcome bonus added';
      return result;
    }
    
    // Don't allow self-referrals
    if (referrer.id === newUserId) {
      await addStandardWelcomeBonus(newUserId, config.inviteeBonus);
      
      result.creditsAwarded = config.inviteeBonus;
      result.message = 'Self-referral not allowed, welcome bonus added';
      return result;
    }
    
    // Update the user with the referrer ID
    await tx.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id }
    });
    
    // Add welcome bonus for the new user
    await addCredits(
      newUserId,
      config.inviteeBonus,
      'referral',
      `referral_welcome_bonus:${referrer.id}`,
      90 // 90 days expiry
    );
    
    // Record the referral information
    await tx.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: newUserId,
        status: 'pending',
        creditsAwarded: 0
      }
    });
    
    // Update the result
    result.creditsAwarded = config.inviteeBonus;
    result.referrer = referrer;
    result.message = 'Referral processed successfully, welcome bonus added';
    
    return result;
  });
}

/**
 * Check and process qualifying referrals
 * This is called periodically to check if referred users have met the minimum spend requirement
 * 
 * @returns Number of referrals processed
 */
export async function processQualifyingReferrals() {
  // Get referral program config
  const config = await getReferralConfig();
  
  // Get all pending referrals
  const pendingReferrals = await prisma.referral.findMany({
    where: {
      status: 'pending'
    },
    include: {
      referred: {
        select: {
          id: true,
          name: true
        }
      },
      referrer: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  
  let processedCount = 0;
  
  // Process each pending referral
  for (const referral of pendingReferrals) {
    // Calculate total credits spent by the referred user
    const spent = await prisma.creditTransaction.aggregate({
      where: {
        userId: referral.referredId,
        amount: { lt: 0 } // Only negative transactions (spending)
      },
      _sum: {
        amount: true
      }
    });
    
    const totalSpent = Math.abs(spent._sum.amount || 0);
    
    // Check if the user has met the minimum spend requirement
    if (totalSpent >= config.minSpendRequirement) {
      // Mark the referral as qualified
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          status: 'complete',
          creditsAwarded: config.inviterBonus,
          completedAt: new Date()
        }
      });
      
      // Update the user record
      await prisma.user.update({
        where: { id: referral.referredId },
        data: {
          referralQualified: true,
          referralCreditsAwarded: config.inviterBonus
        }
      });
      
      // Award the referrer their bonus
      await addCredits(
        referral.referrerId,
        config.inviterBonus,
        'referral',
        `referral_bonus:${referral.referredId}`,
        180 // 180 days expiry
      );
      
      processedCount++;
    }
  }
  
  return processedCount;
}

/**
 * Helper function to add standard welcome bonus for new users
 */
async function addStandardWelcomeBonus(userId: string, amount: number) {
  await addCredits(
    userId,
    amount,
    'bonus',
    'welcome_bonus',
    90 // 90 days expiry
  );
}