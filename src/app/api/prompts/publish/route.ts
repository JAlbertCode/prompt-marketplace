import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { burnCredits } from '@/lib/credits';
import { calculatePromptCreditCost } from '@/lib/models/modelRegistry';

/**
 * Publish a prompt by generating an example output and making it available in the marketplace
 */
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request
    const { promptId } = await req.json();
    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      );
    }
    
    // Get the prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Check if the user owns the prompt
    if (prompt.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only publish your own prompts' },
        { status: 403 }
      );
    }
    
    // Check if the prompt is already published
    if (prompt.isPublished) {
      return NextResponse.json(
        { error: 'Prompt is already published' },
        { status: 400 }
      );
    }
    
    // Generate an example output
    // This would typically call the actual model API
    // For now, we'll simulate it
    
    // Calculate the cost
    const cost = calculatePromptCreditCost(prompt.model, 'medium');
    
    // Burn credits for generating the example
    const success = await burnCredits({
      userId: session.user.id,
      modelId: prompt.model,
      promptLength: 'medium',
      itemType: 'prompt',
      itemId: promptId
    });
    
    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient credits to generate example' },
        { status: 402 }
      );
    }
    
    // Generate example output (in a real implementation, this would use the actual model)
    const exampleOutput = `This is an example output generated for the "${prompt.title}" prompt using ${prompt.model}. In a real implementation, this would be the actual output from the AI model.`;
    
    // Update the prompt as published with the example
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        isPublished: true,
        // In a real implementation, you would save the example output to a separate table
        // or to a field in the prompt model
      }
    });
    
    return NextResponse.json({
      success: true,
      prompt: updatedPrompt,
      exampleOutput
    });
    
  } catch (error) {
    console.error('Error publishing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to publish prompt' },
      { status: 500 }
    );
  }
}
