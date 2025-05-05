/**
 * Stripe Webhook API route
 * 
 * This route handles Stripe webhook events for payment processing
 * It processes events like payment success and adds credits to user accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructStripeEvent, handleWebhookEvent } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook secret from environment variable
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }
    
    // Verify Stripe webhook signature and construct event
    const event = await constructStripeEvent(req, webhookSecret);
    
    // Handle the webhook event
    const result = await handleWebhookEvent(event);
    
    if (result.success) {
      return NextResponse.json({ received: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 400 }
    );
  }
}

// Disable body parsing, as we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
