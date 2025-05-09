/**
 * API route for adding credits to user accounts
 * 
 * This endpoint is used by the credit purchasing system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Define the request schema
const AddCreditsSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['purchased', 'bonus', 'referral']),
  source: z.string().min(1),
  expiryDays: z.number().nullable().optional(),
  userId: z.string().optional(), // Only admin can set this
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
      validationResult = AddCreditsSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }
    
    const { amount, type, source, expiryDays } = validationResult;
    
    // If userId is provided, check if the current user has admin privileges
    let targetUserId = session.user.id;
    
    if (body.userId && body.userId !== session.user.id) {
      // Only admins can add credits to other users
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to add credits to other users' },
          { status: 403 }
        );
      }
      targetUserId = body.userId;
    }
    
    const expiresAt = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;
    
    // Add credits to the user's account by creating a credit bucket
    try {
      const creditBucket = await prisma.creditBucket.create({
        data: {
          userId: targetUserId,
          type,
          amount,
          remaining: amount,
          source,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Also update the user's legacy credits field for backward compatibility
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, credits: true }
      });
      
      if (user) {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { credits: user.credits + amount }
        });
      }
      
      // Get total credits
      const creditBuckets = await prisma.creditBucket.findMany({
        where: {
          userId: targetUserId,
          remaining: { gt: 0 },
          expiresAt: {
            OR: [
              { equals: null },
              { gt: new Date() }
            ]
          }
        }
      });
      
      const total = creditBuckets.reduce((sum, bucket) => sum + bucket.remaining, 0);
      
      // Create a transaction record
      await prisma.creditTransaction.create({
        data: {
          userId: targetUserId,
          amount: amount,
          description: `Added ${amount} credits (${type})`,
          type: 'CREDIT_PURCHASE',
          createdAt: new Date()
        }
      });
      
      return NextResponse.json({
        success: true,
        creditBucket,
        total
      });
    } catch (error) {
      console.error('Error adding credits:', error);
      return NextResponse.json(
        { error: 'Failed to add credits' },
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
