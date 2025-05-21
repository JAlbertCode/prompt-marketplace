import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple health check endpoint for the API
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'PromptFlow API is running'
  });
}