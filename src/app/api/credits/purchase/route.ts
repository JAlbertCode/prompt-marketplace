/**
 * API route for purchasing credits
 * 
 * This endpoint initiates the credit purchase flow by creating a
 * Stripe checkout session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getCreditBundles } from '@/lib/credits';
import { z } from 'zod';

// Define the request schema
const PurchaseSchema = z.object({
  bundleId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request data
    let validationResult;
    try {
      validationResult = PurchaseSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }
    
    const { bundleId } = validationResult;
    
    // Get the bundle info to validate it exists
    const bundles = getCreditBundles();
    const bundle = bundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      return NextResponse.json(
        { error: 'Invalid bundle ID' },
        { status: 400 }
      );
    }
    
    // For enterprise bundles, check monthly burn requirements
    if (bundle.id === 'enterprise' && bundle.requiresMonthlyBurn) {
      // This would check the user's monthly burn from transactions
      // For now, we'll skip this check as it requires a more complex query
      // In a real implementation, this should be properly checked
    }
    
    // Define success and cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${origin}/dashboard/credits/success`;
    const cancelUrl = `${origin}/dashboard/credits`;
    
    try {
      // Create a Stripe checkout session
      const sessionId = await createCheckoutSession(
        session.user.id,
        bundleId,
        successUrl,
        cancelUrl
      );
      
      // Return the session ID to the client for redirect
      return NextResponse.json({
        success: true,
        sessionId,
        redirectUrl: successUrl,
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
