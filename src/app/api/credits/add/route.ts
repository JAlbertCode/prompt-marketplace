import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addCredits, getUserTotalCredits, CreditBucketType } from '@/lib/credits';
import { z } from 'zod';

// Validate request body
const addCreditsSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['purchased', 'bonus', 'referral']).default('purchased'),
  source: z.string().default('manual_addition'),
  expiryDays: z.number().nullable().default(null),
  userId: z.string().optional(), // Only for admin usage
});

/**
 * POST /api/credits/add
 * 
 * Add credits to a user's account
 * Only admin users can add credits to other users
 */
export async function POST(req: NextRequest) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    // Parse and validate request body
    const body = await req.json();
    const validation = addCreditsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    
    const { amount, type, source, expiryDays, userId } = validation.data;
    
    // If userId is provided, ensure the current user is an admin
    if (userId && userId !== currentUserId && !isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized. Only admins can add credits to other users'
      }, { status: 403 });
    }
    
    // Determine which user to add credits to
    const targetUserId = userId || currentUserId;
    
    // Add credits
    await addCredits(
      targetUserId,
      amount,
      type as CreditBucketType,
      source,
      expiryDays
    );
    
    // Return success response with updated credit balance
    return NextResponse.json({
      success: true,
      added: amount,
      total: await getUserTotalCredits(targetUserId)
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}