import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Credit Cleanup Cron Job
 * Runs daily to:
 * 1. Clean up expired credit buckets
 * 2. Mark empty buckets as fully consumed
 */
export async function GET() {
  try {
    // Get current timestamp
    const now = new Date();
    
    // 1. Update expired credit buckets (set remaining to 0)
    const expiredResult = await prisma.creditBucket.updateMany({
      where: {
        // Only consider buckets with remaining credits > 0
        remaining: { gt: 0 },
        // And where expiry is in the past
        expiresAt: {
          not: null,
          lt: now,
        },
      },
      data: {
        remaining: 0,
      },
    });
    
    // 2. Log the cleanup as a system event
    if (expiredResult.count > 0) {
      await prisma.creditTransaction.createMany({
        data: Array(expiredResult.count).fill({
          userId: 'system',
          description: 'Expired credits cleanup',
          type: 'system_cleanup',
          amount: 0, // Just a log entry, not an actual transaction
          creditsUsed: 0,
        }),
      });
    }
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      expiredBuckets: expiredResult.count,
    });
  } catch (error) {
    console.error('Credit cleanup error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Vercel cron jobs require this header
export const config = {
  runtime: 'edge',
};
