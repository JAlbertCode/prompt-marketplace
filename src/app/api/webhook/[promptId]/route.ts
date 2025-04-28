import { NextRequest, NextResponse } from 'next/server';
import { WebhookInfoResponse, InputField } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';

interface Params {
  params: {
    promptId: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { promptId } = params;
  
  try {
    // In a real app with a backend, you would fetch the prompt from a database
    // For the MVP, we'll return a response with placeholder data and the actual URL
    
    // Sample input fields (would be based on the actual prompt in a real app)
    const inputFields: InputField[] = [
      {
        id: 'query',
        label: 'Query',
        placeholder: 'Enter your query here',
        required: true
      },
      {
        id: 'tone',
        label: 'Tone',
        placeholder: 'Professional, casual, friendly, etc.',
        required: false
      }
    ];
    
    const webhookInfo: WebhookInfoResponse = {
      id: promptId,
      name: `Prompt ${promptId}`,
      description: 'Webhook-accessible prompt',
      inputFields,
      webhookInfo: {
        url: `${req.nextUrl.origin}/api/webhook`,
        method: 'POST',
        examplePayload: {
          promptId: promptId,
          inputs: {
            query: 'Example query text',
            tone: 'Professional'
          }
        }
      }
    };
    
    return NextResponse.json(webhookInfo);
  } catch (error) {
    console.error('Error fetching prompt details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve prompt details', details: (error as Error).message },
      { status: 500 }
    );
  }
}
