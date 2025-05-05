/**
 * Stripe Checkout API route
 * 
 * This route creates a Stripe Checkout session for credit purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/payments/stripe';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { bundleId } = body;
    
    if (!bundleId) {
      return NextResponse.json(
        { error: 'Missing bundleId parameter' },
        { status: 400 }
      );
    }
    
    // Get the user ID
    const userId = session.user.id;
    
    // Define success and cancel URLs
    const origin = req.headers.get('origin') || 'https://promptflow.app';
    const successUrl = `${origin}/dashboard/credits/success`;
    const cancelUrl = `${origin}/dashboard/credits`;
    
    // Create Stripe Checkout session
    const sessionId = await createCheckoutSession(
      userId,
      bundleId,
      successUrl,
      cancelUrl
    );
    
    // Return the session ID to redirect to Stripe Checkout
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
