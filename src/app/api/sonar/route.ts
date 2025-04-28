import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get the API key from environment variables
    const apiKey = process.env.SONAR_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Sonar API key is not configured' },
        { status: 500 }
      );
    }

    // Forward the request to the Sonar API
    // Force the model to 'sonar' to avoid deprecated model errors
    const requestBody = { ...body, model: 'sonar' };
    console.log('Sending request to Perplexity API with model: sonar');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API returned error ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `Sonar API Error: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Sonar API route:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
