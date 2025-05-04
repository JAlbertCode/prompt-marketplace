import { NextRequest, NextResponse } from 'next/server';
import { getModelById, calculatePlatformMarkup } from '@/lib/models/modelRegistry';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

export async function POST(request: NextRequest) {
  try {
    const { modelId, creatorFee } = await request.json();
    
    if (!modelId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Model ID is required' 
      }, { status: 400 });
    }
    
    const safeCreatorFee = creatorFee || 0;
    
    // Get the model information
    const model = getModelById(modelId);
    
    if (!model) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid model ID' 
      }, { status: 400 });
    }
    
    // Get the inference cost
    const inferenceCost = model.baseCost;
    
    // Calculate platform markup (only if no creator fee)
    const platformMarkup = safeCreatorFee > 0 ? 0 : calculatePlatformMarkup(inferenceCost);
    
    // Calculate total cost
    const totalCost = inferenceCost + safeCreatorFee + platformMarkup;
    
    // Format dollar cost
    const dollarCost = formatCreditsToDollars(totalCost);
    
    return NextResponse.json({ 
      success: true, 
      breakdown: {
        inferenceCost,
        platformMarkup,
        creatorFee: safeCreatorFee,
        totalCost,
        dollarCost
      }
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to calculate cost' 
    }, { status: 500 });
  }
}
