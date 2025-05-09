import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { chargeForFlowUnlock, hasUnlockedFlow } from '@/utils/creditManager';

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
    const { flowId } = body;

    // Validate required fields
    if (!flowId) {
      return NextResponse.json(
        { error: 'Missing flow ID' },
        { status: 400 }
      );
    }

    // Check if user has already unlocked this flow
    const hasAccess = await hasUnlockedFlow(userId, flowId);
    if (hasAccess) {
      return NextResponse.json({
        success: true,
        alreadyUnlocked: true
      });
    }

    // Charge the user for unlocking the flow
    const success = await chargeForFlowUnlock(userId, flowId);

    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlocking flow:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
