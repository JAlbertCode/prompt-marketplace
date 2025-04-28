import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the API key from environment variables
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Stability API key is not configured' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Call the Stability API
    const url = `https://api.stability.ai/v1/generation/${body.model || 'stable-diffusion-xl'}/text-to-image`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: body.prompt,
            weight: 1
          },
          ...(body.negative_prompt ? [
            {
              text: body.negative_prompt,
              weight: -1
            }
          ] : [])
        ],
        cfg_scale: body.cfg_scale || 7,
        height: body.height || 1024,
        width: body.width || 1024,
        samples: 1,
        steps: body.steps || 30,
        ...(body.seed !== undefined ? { seed: body.seed } : {})
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`Stability API returned error ${response.status}:`, errorData);
      return NextResponse.json(
        { error: `Stability API Error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Transform the response to our expected format
    const transformedResponse = {
      id: data.id || `gen-${Date.now()}`,
      images: data.artifacts.map((artifact: any) => ({
        url: `data:image/png;base64,${artifact.base64}`,
      })),
      created: Date.now(),
      model: body.model || 'stable-diffusion-xl',
    };
    
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Error in Stability API route:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}