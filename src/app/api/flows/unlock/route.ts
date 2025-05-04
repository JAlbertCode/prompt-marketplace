import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { flowId, amount } = body;

    if (!flowId || typeof flowId !== 'string') {
      return NextResponse.json({ error: 'Flow ID is required' }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true, credits: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has enough credits
    if (user.credits < amount) {
      return NextResponse.json(
        { error: 'Insufficient credits', available: user.credits, required: amount },
        { status: 400 }
      );
    }

    // Find the flow to check if it exists and get the creator ID
    const flow = await prisma.promptFlow.findUnique({
      where: { id: flowId },
      select: { id: true, unlockPrice: true, creatorId: true }
    });

    if (!flow) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }

    // Verify the unlock price matches what the client sent
    if (flow.unlockPrice !== amount) {
      return NextResponse.json(
        { error: 'Price mismatch', actualPrice: flow.unlockPrice },
        { status: 400 }
      );
    }

    // Start a transaction to handle atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct credits from user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: { decrement: amount }
        },
        select: { id: true, credits: true }
      });

      // 2. Add credits to creator (80% of the unlock price)
      const creatorShare = Math.floor(amount * 0.8);
      if (flow.creatorId) {
        await tx.user.update({
          where: { id: flow.creatorId },
          data: {
            credits: { increment: creatorShare }
          }
        });
      }

      // 3. Record the transaction in credit history
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -amount,
          reason: 'Flow unlock',
          itemId: flowId,
          itemType: 'flow',
          creatorId: flow.creatorId || null
        }
      });

      // 4. Record creator's earning
      if (flow.creatorId) {
        await tx.creditTransaction.create({
          data: {
            userId: flow.creatorId,
            amount: creatorShare,
            reason: 'Flow unlock earnings',
            itemId: flowId,
            itemType: 'flow',
            creatorId: null
          }
        });
      }

      // 5. Add flow to user's unlocked flows
      await tx.unlockedFlow.create({
        data: {
          userId: user.id,
          flowId: flowId
        }
      });

      return { updatedCredits: updatedUser.credits };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      unlocked: flowId,
      remainingCredits: result.updatedCredits
    });
  } catch (error) {
    console.error('Error unlocking flow:', error);
    return NextResponse.json(
      { error: 'Failed to unlock flow' },
      { status: 500 }
    );
  }
}
