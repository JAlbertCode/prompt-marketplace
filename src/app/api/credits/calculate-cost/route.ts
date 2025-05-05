import { NextRequest, NextResponse } from 'next/server';
import { getModelById, getCostBreakdown, PromptLength, calculatePromptCreditCost } from '@/lib/models/modelRegistry';

export async function POST(request: NextRequest) {
  try {
    const { modelId, promptLength = 'medium', creatorFeePercentage = 0, promptText } = await request.json();
    
    if (!modelId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Model ID is required' 
      }, { status: 400 });
    }
    
    // Get the model information
    const model = getModelById(modelId);
    
    if (!model) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid model ID' 
      }, { status: 400 });
    }
    
    // Determine prompt length if text was provided
    let effectivePromptLength = promptLength as PromptLength;
    
    if (promptText) {
      const charCount = promptText.length;
      if (charCount < 1500) {
        effectivePromptLength = 'short';
      } else if (charCount < 6000) {
        effectivePromptLength = 'medium';
      } else {
        effectivePromptLength = 'long';
      }
    }
    
    // Get the cost breakdown
    const breakdown = getCostBreakdown(modelId, effectivePromptLength, creatorFeePercentage);
    
    return NextResponse.json({ 
      success: true, 
      breakdown,
      promptLength: effectivePromptLength
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to calculate cost',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
