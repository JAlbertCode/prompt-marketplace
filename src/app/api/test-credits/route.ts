/**
 * API route for testing credit functionality
 * This route has been disabled and redirected to the main credits API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
  // Redirect to the main credits API
  return NextResponse.redirect(new URL('/api/credits', req.url));
}

