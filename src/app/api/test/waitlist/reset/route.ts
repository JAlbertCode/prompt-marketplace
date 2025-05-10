import { NextResponse } from 'next/server';

/**
 * Reset waitlist for testing
 * This route has been disabled in production.
 */
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'This test endpoint has been disabled in production.',
    status: 'disabled'
  }, { status: 403 });
}