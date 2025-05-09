/**
 * Stripe Success API route
 * 
 * This route handles successful payments and adds credits to user accounts
 * It's called after a successful Stripe Checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { handleSuccessfulPayment } from '@/lib/payments/stripe';

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }
    
    // Process the successful payment
    const result = await handleSuccessfulPayment(sessionId);
    
    // Ensure the user ID matches
    if (result.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
