import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { burnCredits, getUserTotalCredits, hasEnoughCredits } from '@/lib/credits';
import { getModelById, calculatePromptCreditCost } from '@/lib/models/modelRegistry';
import { z } from 'zod';

// Validate request body
const deductCreditsSchema = z.object({
  modelId: z.string(),
  promptLength: z.enum(['short', 'medium', 'long']).optional(),
  promptText: z.string().optional(),
  creatorId: z.string().optional(),
  creatorFeePercentage: z.number().min(0).max(100).optional(),
  flowId: z.string().optional(),
  itemType: z.enum(['prompt', 'flow', 'completion']).optional(),
  itemId: z.string().optional(),
});

/**
 * POST /api/credits/deduct
 * 
 * Deduct credits from the user's account
 */
export async function POST(req: NextRequest) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse and validate request body
    const body = await req.json();
    const validation = deductCreditsSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    
    const { 
      modelId, 
      promptLength, 
      promptText,
      creatorId,
      creatorFeePercentage,
      flowId,
      itemType,
      itemId
    } = validation.data;
    
    // Verify the model exists
    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    // Calculate the cost
    const cost = calculatePromptCreditCost(
      modelId, 
      promptLength || (promptText ? undefined : 'medium'), 
      creatorFeePercentage || 0
    );
    
    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId, cost);
    if (!hasCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: cost,
        available: await getUserTotalCredits(userId)
      }, { status: 403 });
    }
    
    // Burn credits
    const success = await burnCredits({
      userId,
      modelId,
      promptLength,
      promptText,
      creatorId,
      creatorFeePercentage,
      flowId,
      itemType,
      itemId
    });
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }
    
    // Return success response with updated credit balance
    return NextResponse.json({
      success: true,
      deducted: cost,
      remaining: await getUserTotalCredits(userId)
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json(
      { error: 'Failed to deduct credits' },
      { status: 500 }
    );
  }
}