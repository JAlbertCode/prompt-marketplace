/**
 * Auto-Renewal System for PromptFlow
 * 
 * This file handles the threshold-based auto-renewal functionality:
 * - Checking if a user's credit balance is below their threshold
 * - Triggering automatic purchases when thresholds are reached
 * - Logging and managing auto-renewal attempts
 * - Sending notifications about auto-renewal events
 */

import { prisma } from '@/lib/db';
import { getUserTotalCredits, addCredits } from '@/lib/credits';
import { getCreditBundles } from '@/lib/credits';
import { stripe } from '@/lib/payments/stripe';
import { sendEmail } from '@/lib/email/sendEmail';

/**
 * Check if a user's credit balance is below their auto-renewal threshold
 * and trigger a purchase if needed
 */
export async function checkAutoRenewalThreshold(userId: string): Promise<boolean> {
  try {
    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        autoRenewalEnabled: true,
        autoRenewalThreshold: true,
        autoRenewalBundleId: true,
        stripeCustomerId: true,
        email: true,
        autoRenewalAttempts: true,
        lastAutoRenewalAttempt: true
      }
    });
    
    // Early return if auto-renewal is not enabled or bundle is not set
    if (!user?.autoRenewalEnabled || !user.autoRenewalBundleId) {
      return false;
    }
    
    // Check if the user has exceeded maximum renewal attempts
    const maxAttempts = parseInt(process.env.MAX_AUTO_RENEWAL_ATTEMPTS || '3', 10);
    if (user.autoRenewalAttempts >= maxAttempts) {
      // If last attempt was more than 24 hours ago, reset the counter
      if (user.lastAutoRenewalAttempt && 
          (new Date().getTime() - user.lastAutoRenewalAttempt.getTime() > 24 * 60 * 60 * 1000)) {
        await prisma.user.update({
          where: { id: userId },
          data: { autoRenewalAttempts: 0 }
        });
      } else {
        // Otherwise, don't attempt renewal
        return false;
      }
    }
    
    // Get current credit balance
    const currentBalance = await getUserTotalCredits(userId);
    
    // If current balance is below threshold
    if (currentBalance < user.autoRenewalThreshold) {
      // Trigger auto-renewal
      return await triggerAutoRenewal(userId, user.autoRenewalBundleId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking auto-renewal threshold:', error);
    return false;
  }
}

/**
 * Trigger auto-renewal purchase for a user
 */
export async function triggerAutoRenewal(userId: string, bundleId: string): Promise<boolean> {
  try {
    // Get user's payment methods from Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        stripeCustomerId: true, 
        email: true,
        autoRenewalAttempts: true
      }
    });
    
    if (!user?.stripeCustomerId) {
      throw new Error('No Stripe customer ID found');
    }
    
    // Get bundle details
    const bundle = getCreditBundles().find(b => b.id === bundleId);
    if (!bundle) {
      throw new Error('Invalid bundle ID');
    }
    
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bundle.price * 100, // Convert to cents
      currency: 'usd',
      customer: user.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      description: `Auto-renewal: ${bundle.name} Credit Bundle`,
      metadata: {
        userId,
        bundleId,
        isAutoRenewal: 'true'
      }
    });
    
    // Log the auto-renewal attempt
    await prisma.autoRenewalLog.create({
      data: {
        userId,
        bundleId,
        amount: bundle.price,
        paymentIntentId: paymentIntent.id,
        status: 'pending'
      }
    });
    
    // Update user's auto-renewal attempt counter
    await prisma.user.update({
      where: { id: userId },
      data: { 
        autoRenewalAttempts: { increment: 1 },
        lastAutoRenewalAttempt: new Date()
      }
    });
    
    // Send notification email
    if (user.email) {
      await sendAutoRenewalNotification(user.email, bundle);
    }
    
    return true;
    
  } catch (error) {
    console.error('Auto-renewal failed:', error);
    
    // Log the failure
    await prisma.autoRenewalLog.create({
      data: {
        userId,
        bundleId,
        amount: 0, // Unknown amount since bundle fetching may have failed
        status: 'failed',
        errorMessage: error.message
      }
    });
    
    // Send failure notification
    await sendAutoRenewalFailureNotification(userId);
    
    return false;
  }
}

/**
 * Calculate default threshold based on last purchase
 * Default is 10% of the last purchased bundle
 */
export async function calculateDefaultThreshold(userId: string): Promise<number> {
  try {
    // Find the most recent purchased credit bucket
    const lastPurchase = await prisma.creditBucket.findFirst({
      where: {
        userId,
        type: 'purchased'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!lastPurchase) {
      return 1000000; // Default to 1M credits
    }
    
    // Calculate 10% of the last purchase
    const thresholdPercent = parseInt(process.env.DEFAULT_AUTO_RENEWAL_THRESHOLD_PERCENT || '10', 10);
    const threshold = Math.floor(lastPurchase.amount * (thresholdPercent / 100));
    
    // Minimum threshold of 100,000 credits
    return Math.max(threshold, 100000);
  } catch (error) {
    console.error('Error calculating default threshold:', error);
    return 1000000; // Fall back to 1M credits
  }
}

/**
 * Update user auto-renewal preferences
 */
export async function updateAutoRenewalPreferences(
  userId: string, 
  enabled: boolean, 
  threshold?: number,
  bundleId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      autoRenewalEnabled: enabled
    };
    
    if (threshold !== undefined) {
      updateData.autoRenewalThreshold = threshold;
    }
    
    if (bundleId !== undefined) {
      updateData.autoRenewalBundleId = bundleId;
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    return true;
  } catch (error) {
    console.error('Error updating auto-renewal preferences:', error);
    return false;
  }
}

/**
 * Send email notification about pending auto-renewal
 */
async function sendAutoRenewalNotification(email: string, bundle: any): Promise<boolean> {
  try {
    const templateId = parseInt(process.env.AUTO_RENEWAL_NOTIFICATION_EMAIL_TEMPLATE || '5', 10);
    
    await sendEmail({
      to: email,
      templateId,
      params: {
        bundleName: bundle.name,
        bundlePrice: bundle.price,
        totalCredits: bundle.totalCredits.toLocaleString(),
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending auto-renewal notification:', error);
    return false;
  }
}

/**
 * Send email notification about successful auto-renewal
 */
async function sendAutoRenewalSuccessNotification(userId: string, bundle: any): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email) return false;
    
    const templateId = parseInt(process.env.AUTO_RENEWAL_SUCCESS_EMAIL_TEMPLATE || '6', 10);
    
    await sendEmail({
      to: user.email,
      templateId,
      params: {
        bundleName: bundle.name,
        bundlePrice: bundle.price,
        totalCredits: bundle.totalCredits.toLocaleString(),
        timestamp: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending auto-renewal success notification:', error);
    return false;
  }
}

/**
 * Send email notification about failed auto-renewal
 */
async function sendAutoRenewalFailureNotification(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email) return false;
    
    const templateId = parseInt(process.env.AUTO_RENEWAL_FAILURE_EMAIL_TEMPLATE || '7', 10);
    
    await sendEmail({
      to: user.email,
      templateId,
      params: {
        timestamp: new Date().toISOString(),
        settingsUrl: `${process.env.NEXT_PUBLIC_URL}/settings/credits`
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending auto-renewal failure notification:', error);
    return false;
  }
}
