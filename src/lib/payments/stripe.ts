/**
 * Stripe Integration for PromptFlow
 * 
 * This file handles the Stripe integration for credit purchases:
 * - Creating Stripe Checkout sessions
 * - Managing successful/cancelled payments
 * - Adding purchased credits to user accounts
 * 
 * Credit bundles from instructions:
 * Price    Base      Bonus     Total
 * $10      10M       0         10M
 * $25      25M       2.5M      27.5M
 * $50      50M       7.5M      57.5M
 * $100     100M      20M       120M
 * Enterprise 100M    40M       140M (≥1.4M monthly burn)
 * 
 * 1 credit = $0.000001 USD
 * $1 = 1,000,000 credits
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getCreditBundles, addCredits } from '@/lib/credits';
import { trackEvent } from '@/lib/email/sendEmail';
import { prisma } from '@/lib/db';

// Create and export the Stripe server-side instance
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
export { stripe };

// Use environment variable for Stripe publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

// Export the Stripe promise for use in components
export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Define Stripe product IDs for credit bundles
// These would be created in the Stripe dashboard and referenced here
export const STRIPE_PRODUCT_IDS = {
  starter: process.env.STRIPE_PRODUCT_ID_STARTER,
  basic: process.env.STRIPE_PRODUCT_ID_BASIC,
  pro: process.env.STRIPE_PRODUCT_ID_PRO,
  business: process.env.STRIPE_PRODUCT_ID_BUSINESS,
  enterprise: process.env.STRIPE_PRODUCT_ID_ENTERPRISE,
};

/**
 * Create a Stripe Checkout session for credit purchase
 * @param userId The user ID
 * @param bundleId The credit bundle ID
 * @param successUrl URL to redirect to on successful payment
 * @param cancelUrl URL to redirect to on cancelled payment
 * @returns Checkout session ID
 */
export async function createCheckoutSession(
  userId: string,
  bundleId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  // Get the credit bundle
  const allBundles = getCreditBundles();
  const bundle = allBundles.find(b => b.id === bundleId);
  
  if (!bundle) {
    throw new Error(`Credit bundle ${bundleId} not found`);
  }
  
  try {
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${bundle.name} Credit Package`,
              description: `${bundle.totalCredits.toLocaleString()} credits (${bundle.baseCredits.toLocaleString()} base + ${bundle.bonusCredits.toLocaleString()} bonus)`,
            },
            unit_amount: bundle.price * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&bundle_id=${bundleId}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        bundleId,
        baseCredits: bundle.baseCredits.toString(),
        bonusCredits: bundle.bonusCredits.toString(),
        totalCredits: bundle.totalCredits.toString(),
      },
    });
    
    return session.id;
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Handle successful payment and add credits to user account
 * @param sessionId Stripe Checkout session ID
 * @returns Success status and transaction details
 */
export async function handleSuccessfulPayment(sessionId: string): Promise<{
  success: boolean;
  userId: string;
  bundle: {
    id: string;
    name: string;
    baseCredits: number;
    bonusCredits: number;
    totalCredits: number;
  };
}> {
  try {
    // Retrieve the session to get metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error('Payment was not successful');
    }
    
    const { userId, bundleId, baseCredits, bonusCredits } = session.metadata;
    const totalCredits = parseInt(baseCredits, 10) + parseInt(bonusCredits, 10);
    
    // Get the bundle info
    const allBundles = getCreditBundles();
    const bundle = allBundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      throw new Error(`Credit bundle ${bundleId} not found`);
    }
    
    // Add purchased credits to user account
    await addCredits(
      userId,
      parseInt(baseCredits, 10),
      'purchased',
      `stripe_payment:${sessionId}`,
      null // Purchased credits don't expire
    );
    
    // Add bonus credits if applicable
    if (parseInt(bonusCredits, 10) > 0) {
      await addCredits(
        userId,
        parseInt(bonusCredits, 10),
        'bonus',
        `stripe_bonus:${sessionId}`,
        90 // Bonus credits expire after 90 days
      );
    }
    
    // Track credit purchase event
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      
      if (user?.email) {
        await trackEvent(user.email, 'credits_purchased', {
          BUNDLE_ID: bundleId,
          BUNDLE_NAME: bundle.name,
          PRICE: bundle.price,
          BASE_CREDITS: parseInt(baseCredits, 10),
          BONUS_CREDITS: parseInt(bonusCredits, 10),
          TOTAL_CREDITS: totalCredits,
          PURCHASE_DATE: new Date().toISOString(),
          TRANSACTION_ID: sessionId
        });
      }
    } catch (emailError) {
      // Log but don't fail if tracking fails
      console.error('Error tracking purchase event:', emailError);
    }
    
    // Return success and transaction details
    return {
      success: true,
      userId,
      bundle: {
        id: bundleId,
        name: bundle.name,
        baseCredits: parseInt(baseCredits, 10),
        bonusCredits: parseInt(bonusCredits, 10),
        totalCredits: totalCredits,
      },
    };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw new Error('Failed to process payment');
  }
}

/**
 * Track when a user views a credit purchase page
 */
export async function trackCreditViewEvent(userId: string, bundleId: string): Promise<boolean> {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    if (!user?.email) {
      return false;
    }
    
    // Get bundle info
    const allBundles = getCreditBundles();
    const bundle = allBundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      return false;
    }
    
    // Track the view event
    await trackEvent(user.email, 'credit_page_viewed', {
      BUNDLE_ID: bundleId,
      BUNDLE_NAME: bundle.name,
      PRICE: bundle.price,
      TOTAL_CREDITS: bundle.totalCredits,
      VIEW_DATE: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking credit view event:', error);
    return false;
  }
}

/**
 * Handle webhook events from Stripe
 * @param event The Stripe event
 * @returns Success status
 */
export async function handleWebhookEvent(event: any): Promise<{ success: boolean }> {
  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // If payment is successful, add credits to user account
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session.id);
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Handle successful payment intent
        console.log(`Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }
      
      // Add more event handlers as needed
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { success: false };
  }
}
