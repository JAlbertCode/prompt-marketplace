import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TransactionType } from "@prisma/client";
import { getUserCredits, deductCredits, addCredits } from '@/utils/creditManager';
import { getModelById, calculatePlatformMarkup } from '@/lib/models/modelRegistry';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, promptId, modelId, creatorId, creatorFee } = await request.json();
    
    if (!userId || !promptId || !modelId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID, Prompt ID, and Model ID are required' 
      }, { status: 400 });
    }
    
    // Get the model
    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({
        success: false,
        message: 'Invalid model ID'
      }, { status: 400 });
    }
    
    // Set up the cost breakdown
    const safeCreatorFee = creatorFee || 0;
    const inferenceCost = model.baseCost;
    const platformMarkup = safeCreatorFee > 0 ? 0 : calculatePlatformMarkup(inferenceCost);
    const totalCost = inferenceCost + safeCreatorFee + platformMarkup;
    
    // Check if user has enough credits
    const userCredits = await getUserCredits(userId);
    if (userCredits < totalCost) {
      return NextResponse.json({
        success: false,
        message: 'Not enough credits'
      }, { status: 400 });
    }
    
    // Deduct the total cost from the user
    const newBalance = await deductCredits(
      userId,
      totalCost,
      `Prompt run: ${promptId} using model: ${modelId}`,
      'PROMPT_RUN' as TransactionType
    );
    
    if (newBalance === null) {
      return NextResponse.json({
        success: false,
        message: 'Failed to deduct credits'
      }, { status: 500 });
    }
    
    // If there's a creator fee and creator ID, pay the creator
    if (safeCreatorFee > 0 && creatorId) {
      // Calculate creator portion (80% of fee)
      const creatorPortion = Math.floor(safeCreatorFee * 0.8);
      
      // Add credits to creator
      await addCredits(
        creatorId,
        creatorPortion,
        `Creator payment for prompt: ${promptId}`,
        'CREATOR_PAYMENT' as TransactionType
      );
    }
    
    // Record the prompt run in the database for reporting
    try {
      await prisma.promptRun.create({
        data: {
          userId,
          promptId,
          model: modelId,
          cost: totalCost,
          creatorFee: safeCreatorFee,
          inferenceCost,
          platformFee: platformMarkup
        }
      });
    } catch (dbError) {
      console.error('Error recording prompt run:', dbError);
      // Continue even if the recording fails
    }
    
    return NextResponse.json({
      success: true,
      newBalance,
      costBreakdown: {
        inferenceCost,
        platformMarkup,
        creatorFee: safeCreatorFee,
        totalCost
      }
    });
  } catch (error) {
    console.error('Error charging for prompt run:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process prompt run' 
    }, { status: 500 });
  }
}
