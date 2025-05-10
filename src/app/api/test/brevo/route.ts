import { NextResponse } from 'next/server';

/**
 * Test endpoint for Brevo integration
 * This route has been disabled in production.
 */
export async function GET(request: Request) {
  return NextResponse.json({
    success: false,
    message: 'This test endpoint has been disabled in production.',
    status: 'disabled'
  }, { status: 403 });
}