import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
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

    // For the MVP, we'll return a placeholder image in development
    // In production, we would call the OpenAI API
    if (process.env.NODE_ENV === 'development') {
      // Generate a hash from the prompt to make it somewhat deterministic
      const hash = Buffer.from(body.prompt).toString('base64').substring(0, 10);
      
      // Get size from body or default to 1024x1024
      const size = body.size || '1024x1024';
      const dimensions = size.split('x').map(Number);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a placeholder image from picsum.photos
      return NextResponse.json({
        created: Date.now(),
        data: [
          {
            url: `https://picsum.photos/seed/${hash}/${dimensions[0]}/${dimensions[1]}`,
            revised_prompt: body.prompt
          }
        ]
      });
    }
    
    // In production, call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: body.prompt,
        model: body.model || 'dall-e-3',
        n: body.n || 1,
        size: body.size || '1024x1024',
        quality: body.quality || 'standard',
        style: body.style || 'vivid',
        response_format: 'url'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API returned error ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `OpenAI API Error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in OpenAI image API route:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
