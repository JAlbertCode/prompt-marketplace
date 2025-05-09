/**
 * API route for testing credit functionality
 * This is a temporary route for debugging purposes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get user's credit buckets
    const creditBuckets = await prisma.creditBucket.findMany({
      where: { userId }
    });
    
    // Get user's transactions
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, credits: true }
    });
    
    // Calculate total available credits
    const totalCredits = creditBuckets.reduce((sum, bucket) => sum + bucket.remaining, 0);
    
    // Calculate credit breakdown
    const creditBreakdown = creditBuckets.reduce((acc, bucket) => {
      acc[bucket.type] = (acc[bucket.type] || 0) + bucket.remaining;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      user,
      creditBuckets,
      transactions,
      totalCredits,
      creditBreakdown,
      debug: {
        session: {
          user: session.user,
          expires: session.expires
        }
      }
    });
  } catch (error) {
    console.error('Error testing credits:', error);
    return NextResponse.json(
      { error: 'Error testing credits', details: error },
      { status: 500 }
    );
  }
}
