import { NextRequest, NextResponse } from 'next/server';
import { WebhookRequest, WebhookResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as WebhookRequest;
    
    // Check for API key in header (would be required in production)
    const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      );
    }
    
    // Validate required fields
    if (!body.promptId) {
      return NextResponse.json(
        { error: 'promptId is required' },
        { status: 400 }
      );
    }
    
    if (!body.inputs || Object.keys(body.inputs).length === 0) {
      return NextResponse.json(
        { error: 'inputs are required' },
        { status: 400 }
      );
    }
    
    // In a real webhook implementation, this would:
    // 1. Load the prompt from a database
    // 2. Validate the API key belongs to a user with access to this prompt
    // 3. Execute the prompt against Sonar API
    // 4. Process payments/credits
    // 5. Return the result
    
    // For the MVP, we'll simulate a successful response
    const mockResponse: WebhookResponse = {
      result: "This is a simulated webhook response. In a production environment, this would be the actual generated output from running the prompt with your inputs.",
      promptId: body.promptId,
      creditCost: body.creditCost || 50,
      remainingCredits: 950,
      timestamp: Date.now()
    };
    
    // If this is an image-capable prompt, add a mock image URL
    if (body.capabilities?.includes('image')) {
      mockResponse.imageUrl = "https://picsum.photos/seed/webhook/1024/1024";
    }
    
    // Return the response
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error in webhook route:', error);
    return NextResponse.json(
      { error: 'Error processing webhook request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const promptId = req.nextUrl.searchParams.get('promptId');
  
  if (!promptId) {
    return NextResponse.json(
      { error: 'promptId parameter is required' },
      { status: 400 }
    );
  }
  
  // In a real implementation, this would return information about the webhook
  // for the specified prompt
  const webhookInfo = {
    id: promptId,
    name: "Sample Prompt",
    description: "This is information about the webhook for the specified prompt",
    inputFields: [
      {
        id: "input1",
        label: "Input 1",
        placeholder: "Enter your input",
        required: true
      }
    ],
    webhookInfo: {
      url: `https://api.sonar-prompts.com/run/${promptId}`,
      method: "POST",
      examplePayload: {
        promptId,
        inputs: {
          "input1": "Sample input value"
        }
      }
    }
  };
  
  return NextResponse.json(webhookInfo);
}
