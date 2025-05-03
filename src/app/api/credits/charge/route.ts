import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { chargeForPromptRun } from '@/utils/creditManager';

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
    const { promptId, modelId, promptTokens } = body;

    // Validate required fields
    if (!promptId || !modelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Charge the user for running the prompt
    const success = await chargeForPromptRun(
      userId,
      promptId,
      modelId,
      promptTokens
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error charging for prompt run:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
