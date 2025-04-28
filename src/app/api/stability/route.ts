import { NextRequest, NextResponse } from 'next/server';
import { StabilityApiRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: StabilityApiRequest = await req.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Default values for optional parameters
    const model = body.model || 'stable-diffusion-xl';
    const width = body.width || 1024;
    const height = body.height || 1024;
    const steps = body.steps || 30;
    const cfg_scale = body.cfg_scale || 7;
    
    // For the MVP, we'll use picsum.photos to generate placeholder images
    // This works without requiring an API key
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a deterministic hash based on the prompt to get consistent images for the same prompt
    const hash = Buffer.from(body.prompt).toString('base64').substring(0, 10);
    
    // Return a mock response with a picsum.photos URL
    return NextResponse.json({
      id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      images: [
        {
          url: `https://picsum.photos/seed/${hash}/${width}/${height}`,
        }
      ],
      created: Date.now(),
      model: model,
    });
  } catch (error) {
    console.error('Error in Stability API route:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
