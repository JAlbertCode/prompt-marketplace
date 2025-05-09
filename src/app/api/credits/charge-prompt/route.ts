import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chargeForPromptRun } from '@/utils/creditManager';
import { getUserTotalCredits } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user if available
    const session = await getServerSession(authOptions);
    
    // Parse request body
    const { userId: providedUserId, promptId, modelId, promptText, promptLength, creatorId, creatorFeePercentage } = await request.json();
    
    // Use authenticated user ID if available, otherwise use provided ID
    const userId = session?.user?.id || providedUserId;
    
    if (!userId || !promptId || !modelId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID, Prompt ID, and Model ID are required' 
      }, { status: 400 });
    }
    
    // Charge for the prompt run using the unified credit system
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
      
      return NextResponse.json({
        success: false,
        message: 'Insufficient credits',
        availableCredits: currentCredits,
        requiredCredits: result.costBreakdown?.totalCost || 0
      }, { status: 402 });
    }
    
    // Return success response with cost breakdown and updated balance
    return NextResponse.json({
      success: true,
      costBreakdown: result.costBreakdown,
      availableCredits: await getUserTotalCredits(userId)
    });
  } catch (error) {
    console.error('Error charging for prompt run:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process prompt run' 
    }, { status: 500 });
  }
}
