import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all unlocked flows for the user
    const unlockedFlows = await prisma.unlockedFlow.findMany({
      where: { userId: user.id },
      select: { flowId: true }
    });

    // Extract just the flow IDs
    const flowIds = unlockedFlows.map(unlocked => unlocked.flowId);

    // Return the list of unlocked flow IDs
    return NextResponse.json({
      unlockedFlows: flowIds
    });
  } catch (error) {
    console.error('Error fetching unlocked flows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unlocked flows' },
      { status: 500 }
    );
  }
}
