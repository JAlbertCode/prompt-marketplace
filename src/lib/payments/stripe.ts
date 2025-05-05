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
  
  // Import Stripe server-side
  const stripe = require('stripe')(stripeSecretKey);
  
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
  // Import Stripe server-side
  const stripe = require('stripe')(stripeSecretKey);
  
  try {
    // Retrieve the session to get metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      throw new Error('Payment was not successful');
    }
    
    const { userId, bundleId, baseCredits, bonusCredits } = session.metadata;
    
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
      365 // Purchased credits expire after 1 year
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
    
    // Return success and transaction details
    return {
      success: true,
      userId,
      bundle: {
        id: bundleId,
        name: bundle.name,
        baseCredits: parseInt(baseCredits, 10),
        bonusCredits: parseInt(bonusCredits, 10),
        totalCredits: parseInt(baseCredits, 10) + parseInt(bonusCredits, 10),
      },
    };
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw new Error('Failed to process payment');
  }
}

/**
 * Retrieve payment intent status
 * @param paymentIntentId The payment intent ID
 * @returns Payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
  // Import Stripe server-side
  const stripe = require('stripe')(stripeSecretKey);
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment status');
  }
}

/**
 * Get list of previous transactions for a user
 * @param userId The user ID
 * @param limit Maximum number of transactions to return
 * @returns Array of transaction details
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  date: Date;
  amount: number;
  currency: string;
  description: string;
  bundleId: string;
  credits: number;
  status: string;
}>> {
  // Import Stripe server-side
  const stripe = require('stripe')(stripeSecretKey);
  
  try {
    // Get payment intents for the user
    const paymentIntents = await stripe.paymentIntents.list({
      customer: userId, // Assuming user ID is the same as Stripe customer ID
      limit,
    });
    
    // Map payment intents to transaction objects
    return paymentIntents.data.map((intent: any) => {
      const metadata = intent.metadata || {};
      return {
        id: intent.id,
        date: new Date(intent.created * 1000), // Convert from Unix timestamp
        amount: intent.amount / 100, // Convert from cents to dollars
        currency: intent.currency,
        description: metadata.description || 'Credit purchase',
        bundleId: metadata.bundleId || 'unknown',
        credits: parseInt(metadata.totalCredits, 10) || 0,
        status: intent.status,
      };
    });
  } catch (error) {
    console.error('Error retrieving user transactions:', error);
    return [];
  }
}

/**
 * Create a Stripe webhook handler
 * @param req The HTTP request
 * @param secret The webhook secret
 * @returns The event if signature verification succeeds
 */
export async function constructStripeEvent(req: Request, secret: string): Promise<any> {
  // Import Stripe server-side
  const stripe = require('stripe')(stripeSecretKey);
  
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    throw new Error('No Stripe signature in request');
  }
  
  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error('Failed to verify webhook signature');
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
        // This is often redundant with checkout.session.completed for simple cases
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