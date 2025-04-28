import { NextRequest, NextResponse } from 'next/server';
import { executePrompt } from '@/lib/sonarApi';
import { getBaselineCost } from '@/lib/creditHelpers';
import { WebhookRequest, WebhookResponse, SonarModel } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';

// For now, we'll mock this
const userSettings: Record<string, {
  apiKey?: string;
  maxCredits: number;
  usedCredits: number;
}> = {
  'anonymous': {
    maxCredits: 1000,
    usedCredits: 0
  }
};

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
    
    // In a real app with authentication, we would check if the user has access to this prompt
    // For now, we'll use the promptId directly with no authentication
    
    // For the webhook API in server context we'll use a mock prompt
    // In production, we would fetch the actual prompt from a database
    let mockPrompt;
    
    // Mock data settings
    if (body.systemPrompt) {
      // If the request includes a system prompt, use that
      mockPrompt = {
        id: body.promptId,
        systemPrompt: body.systemPrompt,
        model: body.model || 'sonar-medium-chat' as SonarModel,
        creditCost: body.creditCost || getBaselineCost('sonar-medium-chat'),
        isPrivate: true, // Treat custom prompt executions as private
        ownerId: body.userId || 'anonymous'
      };
    } else {
      // Otherwise use a default system prompt
      mockPrompt = {
        id: body.promptId,
        systemPrompt: 'You are a helpful AI assistant. Respond to the user\'s query accurately and concisely.',
        model: body.model || 'sonar-medium-chat' as SonarModel,
        creditCost: body.creditCost || getBaselineCost('sonar-medium-chat'),
      };
    }
    
    // Mock credit checking
    // In a real app, this would check against a user's account in a database
    const userId = body.userId || 'anonymous';
    const userCredits = 1000; // Mock unlimited credits for webhook testing
    
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
    
    // Mock credit deduction (in a real app, this would update a database)
    const remainingCredits = userCredits - mockPrompt.creditCost;
    
    // Return the response
    const response: WebhookResponse = {
      result,
      promptId: mockPrompt.id,
      creditCost: mockPrompt.creditCost,
      remainingCredits,
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
