import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCredits } from '@/lib/credits';
import { prisma } from '@/lib/db';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Stripe webhook handler
 * Handles events from Stripe for payment processing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;
    
    // Verify webhook signature
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`⚠️ Webhook signature verification failed: ${errorMessage}`);
      
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Add credits to user account based on the purchased bundle
        if (session.metadata?.creditBundle && session.metadata?.userId) {
          const { creditBundle, userId } = session.metadata;
          
          // Determine credit amounts based on the bundle
          let baseCredits = 0;
          let bonusCredits = 0;
          
          switch (creditBundle) {
            case 'starter':
              baseCredits = 10_000_000;
              bonusCredits = 0;
              break;
            case 'basic':
              baseCredits = 25_000_000;
              bonusCredits = 2_500_000;
              break;
            case 'pro':
              baseCredits = 50_000_000;
              bonusCredits = 7_500_000;
              break;
            case 'business':
              baseCredits = 100_000_000;
              bonusCredits = 20_000_000;
              break;
            case 'enterprise':
              baseCredits = 100_000_000;
              bonusCredits = 40_000_000;
              break;
            default:
              console.error(`Unknown credit bundle: ${creditBundle}`);
              return NextResponse.json(
                { error: 'Unknown credit bundle' },
                { status: 400 }
              );
          }
          
          // Add base credits (purchased)
          await addCredits(
            userId,
            baseCredits,
            'purchased',
            `stripe_purchase:${session.id}`,
            365 // 1 year expiry
          );
          
          // Add bonus credits if any
          if (bonusCredits > 0) {
            await addCredits(
              userId,
              bonusCredits,
              'bonus',
              `stripe_bonus:${session.id}`,
              180 // 6 months expiry
            );
          }
          
          // Log the transaction
          await prisma.creditTransaction.create({
            data: {
              userId,
              amount: baseCredits + bonusCredits,
              description: `Credit purchase: ${creditBundle}`,
              type: 'credit_purchase',
            },
          });
          
          console.log(`Credits added for user ${userId}: ${baseCredits + bonusCredits}`);
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle subscription payments
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Handle successful one-time payments
        break;
      }
      
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle async payment methods (bank transfers, etc.)
        break;
      }
      
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle failed async payments
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Handle subscription cancellations
        break;
      }
      
      // More event types can be handled here
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable body parsing to get raw request body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
