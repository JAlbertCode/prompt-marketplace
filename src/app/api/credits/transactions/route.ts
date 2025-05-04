import { NextRequest, NextResponse } from 'next/server';
import { getUserTransactions } from '@/utils/creditManager';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }
    
    const { transactions, pagination } = await getUserTransactions(userId, page, limit);
    
    return NextResponse.json({ 
      success: true, 
      transactions,
      pagination
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch transactions' 
    }, { status: 500 });
  }
}
