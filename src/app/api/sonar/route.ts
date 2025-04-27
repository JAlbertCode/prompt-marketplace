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
    const response = await fetch('https://sonar.perplexity.ai/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

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
