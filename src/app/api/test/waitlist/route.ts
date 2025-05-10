import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check email status in waitlist
 * This route has been disabled in production.
 */
export async function GET(request: Request) {
  return NextResponse.json({
    success: false,
    message: 'This test endpoint has been disabled in production.',
    status: 'disabled'
  }, { status: 403 });
}