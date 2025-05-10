import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { headers } from "next/headers";
import { addCredits } from "@/lib/credits";
import { handleSuccessfulAutoRenewal, handleFailedAutoRenewal } from "@/lib/autoRenewal";

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature") as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(`💰 PaymentIntent successful: ${paymentIntent.id}`);
        
        // Check if this is an auto-renewal payment
        if (paymentIntent.metadata?.isAutoRenewal === 'true') {
          await handleSuccessfulAutoRenewal(paymentIntent);
        } else {
          // Regular payment - process normally
          await handleSuccessfulPayment(paymentIntent);
        }
        break;
        
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${failedPaymentIntent.id}`);
        
        // Check if this is an auto-renewal payment
        if (failedPaymentIntent.metadata?.isAutoRenewal === 'true') {
          await handleFailedAutoRenewal(failedPaymentIntent);
        }
        break;
        
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(`🛒 Checkout session completed: ${session.id}`);
        await handleSuccessfulCheckout(session);
        break;
        
      default:
        // Unexpected event type
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 */
async function handleSuccessfulPayment(paymentIntent: any) {
  const { userId, bundleId } = paymentIntent.metadata;
  
  if (!userId || !bundleId) {
    console.error("Missing metadata in payment intent:", paymentIntent.id);
    return;
  }
  
  switch (bundleId) {
    case "starter":
      // 10M credits for $10
      await addCredits(userId, 10_000_000, "purchased", `stripe_payment:${paymentIntent.id}`);
      break;
      
    case "basic":
      // 25M + 2.5M bonus credits for $25
      await addCredits(userId, 25_000_000, "purchased", `stripe_payment:${paymentIntent.id}`);
      await addCredits(userId, 2_500_000, "bonus", `stripe_bonus:${paymentIntent.id}`, 90); // 90 days expiry
      break;
      
    case "pro":
      // 50M + 7.5M bonus credits for $50
      await addCredits(userId, 50_000_000, "purchased", `stripe_payment:${paymentIntent.id}`);
      await addCredits(userId, 7_500_000, "bonus", `stripe_bonus:${paymentIntent.id}`, 90);
      break;
      
    case "business":
      // 100M + 20M bonus credits for $100
      await addCredits(userId, 100_000_000, "purchased", `stripe_payment:${paymentIntent.id}`);
      await addCredits(userId, 20_000_000, "bonus", `stripe_bonus:${paymentIntent.id}`, 90);
      break;
      
    case "enterprise":
      // 100M + 40M bonus credits for $100 (enterprise tier)
      await addCredits(userId, 100_000_000, "purchased", `stripe_payment:${paymentIntent.id}`);
      await addCredits(userId, 40_000_000, "bonus", `stripe_bonus:${paymentIntent.id}`, 90);
      break;
      
    default:
      console.error("Unknown bundle ID:", bundleId);
  }
}

/**
 * Handle successful checkout session
 */
async function handleSuccessfulCheckout(session: any) {
  // Extract the product ID from the line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  
  if (!lineItems.data.length) {
    console.error("No line items found in checkout session:", session.id);
    return;
  }
  
  const productId = lineItems.data[0].price?.product as string;
  const userId = session.metadata?.userId;
  
  if (!productId || !userId) {
    console.error("Missing product ID or user ID in checkout session:", session.id);
    return;
  }
  
  // Map Stripe product IDs to our bundle IDs
  const productToBundleMap: Record<string, string> = {
    [process.env.STRIPE_PRODUCT_ID_STARTER as string]: "starter",
    [process.env.STRIPE_PRODUCT_ID_BASIC as string]: "basic",
    [process.env.STRIPE_PRODUCT_ID_PRO as string]: "pro",
    [process.env.STRIPE_PRODUCT_ID_BUSINESS as string]: "business",
    [process.env.STRIPE_PRODUCT_ID_ENTERPRISE as string]: "enterprise",
  };
  
  const bundleId = productToBundleMap[productId];
  
  if (bundleId) {
    const paymentIntentId = session.payment_intent;
    
    // Process the payment using the same logic as payment_intent.succeeded
    await handleSuccessfulPayment({
      id: paymentIntentId,
      metadata: {
        userId,
        bundleId
      }
    });
  } else {
    console.error("Unknown product ID:", productId);
  }
}
