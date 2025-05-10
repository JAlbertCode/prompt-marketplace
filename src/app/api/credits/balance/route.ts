import { NextResponse } from 'next/server';
import { getUserTotalCredits } from '@/lib/credits';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user's total credits
    const balance = await getUserTotalCredits(userId);
    
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error getting credit balance:', error);
    
    return NextResponse.json(
      { error: 'Failed to get credit balance' },
      { status: 500 } // Return 500 to indicate server error
    );
  }
}