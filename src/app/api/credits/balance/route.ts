import { NextRequest, NextResponse } from 'next/server';
import { getUserCredits } from '@/utils/creditManager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    const balance = await getUserCredits(userId);
    
    return NextResponse.json({ 
      success: true, 
      balance 
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch credit balance' 
    }, { status: 500 });
  }
}
