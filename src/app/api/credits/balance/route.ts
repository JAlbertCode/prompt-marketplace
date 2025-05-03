import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserCredits } from '@/utils/creditManager';

export async function GET(req: NextRequest) {
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
    
    // Get user's credit balance
    const credits = await getUserCredits(userId);
    
    return NextResponse.json({ 
      credits,
      dollarValue: (credits / 1000000).toFixed(6)
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve credit balance' },
      { status: 500 }
    );
  }
}
