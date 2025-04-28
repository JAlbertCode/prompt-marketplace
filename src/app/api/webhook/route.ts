import { NextRequest, NextResponse } from 'next/server';
import { executePrompt } from '@/lib/sonarApi';
import { getBaselineCost } from '@/lib/creditHelpers';
import { WebhookRequest, WebhookResponse, SonarModel } from '@/types';

// For now, we'll store credit usage in memory as a mock
// In a real app, this would be in a database
const creditUsage: Record<string, number> = {};

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: WebhookRequest = await req.json();
    
    // Basic validation
    if (!body.promptId) {
      return NextResponse.json(
        { error: 'Missing promptId in request' },
        { status: 400 }
      );
    }
    
    if (!body.inputs || typeof body.inputs !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid inputs in request' },
        { status: 400 }
      );
    }
    
    // Mock prompt retrieval (in a real app, this would fetch from a database)
    // For now, we'll use a simple mock structure
    const mockPrompt = {
      id: body.promptId,
      systemPrompt: body.systemPrompt || 'You are a helpful assistant.',
      model: body.model || 'sonar-medium-chat' as SonarModel,
      creditCost: body.creditCost || getBaselineCost('sonar-medium-chat'),
    };
    
    // Mock credit checking
    // In a real app, this would check against a user's account
    const userId = body.userId || 'anonymous';
    const userCredits = 1000 - (creditUsage[userId] || 0);
    
    if (userCredits < mockPrompt.creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', remaining: userCredits, required: mockPrompt.creditCost },
        { status: 402 } // 402 Payment Required
      );
    }
    
    // Execute the prompt with Sonar API
    const result = await executePrompt(
      mockPrompt.systemPrompt,
      body.inputs,
      mockPrompt.model
    );
    
    // Deduct credits (mock implementation)
    creditUsage[userId] = (creditUsage[userId] || 0) + mockPrompt.creditCost;
    
    // Return the response
    const response: WebhookResponse = {
      result,
      promptId: mockPrompt.id,
      creditCost: mockPrompt.creditCost,
      remainingCredits: 1000 - creditUsage[userId],
      timestamp: Date.now()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in webhook execution:', error);
    return NextResponse.json(
      { error: 'Error processing webhook request', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET handler for testing the webhook
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Webhook API is operational',
    usage: 'Send a POST request with promptId and inputs to execute a prompt',
    example: {
      promptId: '123',
      inputs: {
        query: 'What is the capital of France?'
      },
      userId: 'user_123' // Optional
    }
  });
}
