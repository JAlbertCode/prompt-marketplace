import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { addCredits, getUserTotalCredits } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, amount, reason, expiryDays } = body;
    
    // Validate inputs
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Credit amount is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // For positive adjustments, add credits to user account
    if (amount > 0) {
      await addCredits(
        userId,
        amount,
        reason === 'bonus' ? 'bonus' : 'purchased', // Use bonus bucket for bonus reason, otherwise purchased
        `admin_adjustment:${session.user.id}:${reason}`,
        expiryDays || null
      );
      
      // Log the admin action
      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'CREDIT_ADJUSTMENT',
          details: JSON.stringify({
            userId,
            amount,
            reason,
            expiryDays
          })
        }
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: `Added ${amount.toLocaleString()} credits to user ${userId}`,
        newBalance: await getUserTotalCredits(userId)
      });
    }
    
    // For negative adjustments, deduct credits
    if (amount < 0) {
      // Check if user has enough credits
      const userCredits = await getUserTotalCredits(userId);
      
      if (userCredits < Math.abs(amount)) {
        return NextResponse.json(
          { 
            error: 'User does not have enough credits for this deduction',
            available: userCredits,
            requested: Math.abs(amount)
          },
          { status: 400 }
        );
      }
      
      // Since we're deducting credits, we need to invert the amount to a negative value
      // then use burnCredits from the credits module
      const absAmount = Math.abs(amount);
      
      // Call a special admin-only credit burn operation that doesn't require model ID
      // This is a simplified version for admin adjustments only
      await prisma.$transaction(async (tx) => {
        // Get all user's credit buckets with remaining balance
        const buckets = await tx.creditBucket.findMany({
          where: {
            userId,
            remaining: { gt: 0 }
          },
          orderBy: [
            // Priority order: purchased → bonus → referral
            {
              type: 'asc'
            },
            // Oldest first within each type
            {
              createdAt: 'asc'
            }
          ]
        });
        
        let remainingToDeduct = absAmount;
        
        // Deduct from buckets in priority order
        for (const bucket of buckets) {
          if (remainingToDeduct <= 0) break;
          
          const amountFromBucket = Math.min(bucket.remaining, remainingToDeduct);
          
          // Update the bucket
          await tx.creditBucket.update({
            where: { id: bucket.id },
            data: { remaining: { decrement: amountFromBucket } }
          });
          
          remainingToDeduct -= amountFromBucket;
        }
        
        // Log the transaction
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: -absAmount, // Negative amount for deductions
            description: `Admin adjustment: ${reason}`,
            source: `admin_adjustment:${session.user.id}`
          }
        });
      });
      
      // Log the admin action
      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'CREDIT_ADJUSTMENT',
          details: JSON.stringify({
            userId,
            amount,
            reason
          })
        }
      });
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: `Deducted ${absAmount.toLocaleString()} credits from user ${userId}`,
        newBalance: await getUserTotalCredits(userId)
      });
    }
    
    // If amount is zero, just return success
    return NextResponse.json({
      success: true,
      message: 'No credits were adjusted (amount was zero)',
      newBalance: await getUserTotalCredits(userId)
    });
  } catch (error) {
    console.error('Error adjusting credits:', error);
    return NextResponse.json(
      { error: 'Failed to adjust credits' },
      { status: 500 }
    );
  }
}