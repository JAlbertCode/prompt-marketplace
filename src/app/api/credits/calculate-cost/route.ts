import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getModelById } from '@/lib/models/modelRegistry';
import { calculatePlatformMarkup } from '@/utils/creditManager';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const promptId = url.searchParams.get('promptId');
    const modelId = url.searchParams.get('modelId');
    const promptLength = url.searchParams.get('promptLength') as 'short' | 'medium' | 'long' || 'medium';
    
    if (!promptId || !modelId) {
      return NextResponse.json(
        { error: 'Prompt ID and model ID are required' },
        { status: 400 }
      );
    }

    // Get prompt to check for creator fee
    const prompt = await prisma.prompt.findUnique({
      where: {
        id: promptId,
      },
      select: {
        creatorFee: true,
        creatorId: true,
      },
    });
    
    const creatorFee = prompt?.creatorFee || 0;

    // Get model info
    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json(
        { error: `Model ${modelId} not found` },
        { status: 404 }
      );
    }

    // Get inference cost from model
    const inferenceCost = model.cost[promptLength];
    
    // Calculate platform markup
    const hasCreatorFee = creatorFee > 0;
    const platformMarkup = calculatePlatformMarkup(inferenceCost, hasCreatorFee);
    
    // Calculate total cost
    const totalCost = inferenceCost + creatorFee + platformMarkup;

    return NextResponse.json({
      inferenceCost,
      creatorFee,
      platformMarkup,
      totalCost,
    });
  } catch (error) {
    console.error('Error calculating prompt cost:', error);
    
    // Default values for fallback
    const fallbackCost = {
      inferenceCost: 8500, // Medium GPT-4o cost
      creatorFee: 0,
      platformMarkup: 850, // 10% markup
      totalCost: 9350,
    };
    
    return NextResponse.json(
      { ...fallbackCost, fallback: true, error: 'Using fallback cost calculation' },
      { status: 200 } // Return 200 with fallback data
    );
  }
}