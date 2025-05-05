import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chargeForPromptRun } from '@/utils/creditManager';
import { getUserTotalCredits } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { promptId, modelId, promptText, promptLength } = body;

    // Validate required fields
    if (!promptId || !modelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Charge the user for running the prompt
    const result = await chargeForPromptRun(
      userId,
      promptId,
      modelId,
      promptLength,
      promptText
    );

    if (!result.success) {
      // Get current balance to return to the client
      const currentCredits = await getUserTotalCredits(userId);
      
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          availableCredits: currentCredits,
          requiredCredits: result.costBreakdown?.totalCost || 0
        },
        { status: 402 }
      );
    }

    // Return success response with cost breakdown
    return NextResponse.json({
      success: true,
      costBreakdown: result.costBreakdown,
      availableCredits: await getUserTotalCredits(userId)
    });
  } catch (error) {
    console.error('Error charging for prompt run:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
