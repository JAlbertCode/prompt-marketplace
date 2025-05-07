import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get current path
  const path = request.nextUrl.pathname;

  // Public paths that should always be accessible
  const publicPaths = [
    '/',
    '/waitlist',
    '/api/waitlist',
    '/api/auth',
    '/auth',
    '/login',
    '/register',
    '/_next',
    '/static',
    '/fonts',
    '/favicon.ico',
  ];
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // If path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for auth cookie (simple localStorage-based auth)
  const authCookie = request.cookies.get('auth');
  
  // Check for next-auth session
  const sessionCookie = request.cookies.get('next-auth.session-token');
  
  // If user has either authentication method, allow access
  if (authCookie?.value === 'true' || sessionCookie) {
    return NextResponse.next();
  }

  // Otherwise, redirect to waitlist
  return NextResponse.redirect(new URL('/waitlist', request.url));
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones we explicitly list
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};