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

    // Keep prompt simple and shorter than 1000 characters
    const cleanPrompt = body.prompt.substring(0, 250);

    console.log(`Calling OpenAI API for image generation with model: dall-e-3`);
    console.log(`Prompt: "${cleanPrompt}"`);
    
    // Prepare request exactly according to OpenAI documentation
    // https://platform.openai.com/docs/guides/images
    const requestPayload = {
      "prompt": cleanPrompt,
      "model": "dall-e-3",
      "n": 1,
      "size": "1024x1024",
      "quality": "standard",
      "style": "vivid",
      "response_format": "url"
    }
    
    
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      let errorMessage = `OpenAI API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('OpenAI API error details:', errorData);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing OpenAI error response:', e);
      }
      
      console.error('OpenAI API error:', errorMessage);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Successfully generated image with OpenAI');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in OpenAI image API route:', error);
    
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}