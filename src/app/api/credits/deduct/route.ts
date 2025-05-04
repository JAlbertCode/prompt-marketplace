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
    const { amount, reason, itemId, itemType } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!reason || !itemId || !itemType) {
      return NextResponse.json({ error: 'reason, itemId, and itemType are required' }, { status: 400 });
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

    // Get creator information for profit sharing
    let creatorId = null;
    let creatorShare = 0;

    if (itemType === 'prompt') {
      const prompt = await prisma.prompt.findUnique({
        where: { id: itemId },
        select: { id: true, creatorId: true, creatorFee: true }
      });

      if (prompt && prompt.creatorId && prompt.creatorFee > 0) {
        creatorId = prompt.creatorId;
        creatorShare = prompt.creatorFee;
      }
    } else if (itemType === 'flow') {
      const promptStep = await prisma.promptFlowStep.findFirst({
        where: { flowId: itemId },
        select: { prompt: { select: { id: true, creatorId: true, creatorFee: true } } }
      });

      if (promptStep?.prompt?.creatorId && promptStep.prompt.creatorFee > 0) {
        creatorId = promptStep.prompt.creatorId;
        creatorShare = promptStep.prompt.creatorFee;
      }
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

      // 2. Add credits to creator if applicable
      if (creatorId && creatorShare > 0) {
        await tx.user.update({
          where: { id: creatorId },
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
          reason,
          itemId,
          itemType,
          creatorId: creatorId || null
        }
      });

      // 4. Record creator's earning if applicable
      if (creatorId && creatorShare > 0) {
        await tx.creditTransaction.create({
          data: {
            userId: creatorId,
            amount: creatorShare,
            reason: `Creator earnings: ${reason}`,
            itemId,
            itemType,
            creatorId: null
          }
        });
      }

      return { updatedCredits: updatedUser.credits };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      remainingCredits: result.updatedCredits
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}
