/**
 * User Onboarding Functions
 * 
 * This file contains functions for user onboarding flows,
 * including adding initial credits for new users.
 */

import { prisma } from './db';
import { addCredits } from './credits';

// The default amount of credits for new users (1 million)
export const DEFAULT_NEW_USER_CREDITS = 1_000_000;

/**
 * Ensure a user has default credits
 * If the user has no credits, add the default amount
 * 
 * @param userId The user ID to check and potentially add credits for
 */
export async function ensureUserHasCredits(userId: string): Promise<void> {
  try {
    // Check if user already has credit buckets
    const existingBuckets = await prisma.creditBucket.findMany({
      where: { userId },
      take: 1 // We only need to check if any exist
    });
    
    // If no credits exist, add the default amount
    if (existingBuckets.length === 0) {
      console.log(`Adding default credits (${DEFAULT_NEW_USER_CREDITS}) for new user: ${userId}`);
      
      await addCredits(
        userId,
        DEFAULT_NEW_USER_CREDITS,
        'bonus',
        'new_user_signup',
        365 // Credits expire after 1 year
      );
      
      // Log the welcome credit addition
      await prisma.creditTransaction.create({
        data: {
          userId,
          creditsAdded: DEFAULT_NEW_USER_CREDITS,
          description: 'Welcome bonus credits',
          type: 'WELCOME_BONUS'
        }
      });
    }
  } catch (error) {
    console.error('Error ensuring user has credits:', error);
    // Don't throw - we don't want to block login/signup if this fails
  }
}

/**
 * Complete user onboarding process
 * This should be called after a user is created
 * 
 * @param userId The user ID to onboard
 */
export async function completeUserOnboarding(userId: string): Promise<void> {
  // Ensure user has default credits
  await ensureUserHasCredits(userId);
  
  // Additional onboarding steps can be added here
  // Such as creating default content, sending welcome emails, etc.
}
