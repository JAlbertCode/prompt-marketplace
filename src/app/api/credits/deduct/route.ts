import { NextResponse } from 'next/server';
import { burnCredits } from '@/lib/credits';
import { getUserTotalCredits } from '@/lib/credits';

export async function POST(request: Request) {
  try {
    const { userId, amount, description, type } = await request.json();
    
    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }
    
    // Check if user has enough credits first
    const totalCredits = await getUserTotalCredits(userId);
    
    if (totalCredits < amount) {
      return NextResponse.json(
        { error: 'Insufficient credits', balance: totalCredits },
        { status: 400 }
      );
    }
    
    // Burn credits using the core credit system
    // Note: This is simplified - in a real implementation you'd use more parameters
    const success = await burnCredits({
      userId,
      modelId: 'generic', // Generic model for direct deduction
      itemType: 'completion',
      itemId: `manual_${Date.now()}`
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      );
    }
    
    // Get updated balance
    const newBalance = await getUserTotalCredits(userId);
    
    return NextResponse.json({ success: true, balance: newBalance });
  } catch (error) {
    console.error('Error deducting credits:', error);
    
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}