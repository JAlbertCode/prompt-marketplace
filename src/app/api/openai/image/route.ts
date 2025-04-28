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

    // Forward the request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: body.prompt,
        model: body.model || 'dall-e-3',
        n: body.n || 1,
        size: body.size || '1024x1024',
        quality: body.quality || 'standard',
        style: body.style || 'vivid',
        response_format: 'url',
      }),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API returned error ${response.status}:`, errorText);
      
      // For safety, fall back to a placeholder image if OpenAI fails
      if (process.env.NODE_ENV === 'development') {
        // Generate a hash from the prompt to make it somewhat deterministic
        const hash = Buffer.from(body.prompt).toString('base64').substring(0, 10);
        const size = body.size === '1024x1024' ? '1024/1024' : 
                    body.size === '1792x1024' ? '1792/1024' : 
                    body.size === '1024x1792' ? '1024/1792' : '1024/1024';
        
        return NextResponse.json({
          created: Date.now(),
          data: [
            {
              url: `https://picsum.photos/seed/${hash}/${size.replace('x', '/')}`,
            }
          ]
        });
      }
      
      return NextResponse.json(
        { error: `OpenAI API Error: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in OpenAI image API route:', error);
    
    // For safety, in development, fall back to a placeholder
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        created: Date.now(),
        data: [
          {
            url: 'https://picsum.photos/1024',
          }
        ]
      });
    }
    
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
