import { NextRequest, NextResponse } from 'next/server';
import { addCredits } from '@/utils/creditManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description, type } = await request.json();
    
    if (!userId || amount === undefined || !type) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID, amount and type are required' 
      }, { status: 400 });
    }
    
    if (amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Amount must be positive' 
      }, { status: 400 });
    }
    
    const newBalance = await addCredits(
      userId, 
      amount, 
      description || `Added ${amount} credits`, 
      type
    );
    
    return NextResponse.json({ 
      success: true, 
      newBalance
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add credits' 
    }, { status: 500 });
  }
}
