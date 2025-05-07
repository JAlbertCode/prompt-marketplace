import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Environment check - only apply protection in production
const isProduction = process.env.NODE_ENV === 'production';

export function middleware(request: NextRequest) {
  // Get session cookie
  const session = request.cookies.get('next-auth.session-token');
  
  // Get current path
  const path = request.nextUrl.pathname;
  
  // Paths that are always allowed (public routes)
  const publicPaths = [
    '/waitlist',
    '/api/waitlist',
    '/api/auth',
    '/auth/login',
    '/login',
    '/register',
    '/_next',
    '/static',
    '/fonts',
    '/favicon.ico',
  ];
  
  // Check if path is public or path starts with any of the public paths
  const isPublicPath = publicPaths.some((publicPath) => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // Skip protection in development mode (allow all routes)
  if (!isProduction) {
    return NextResponse.next();
  }
  
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // No session, redirect to waitlist
  if (!session) {
    const waitlistUrl = new URL('/waitlist', request.url);
    return NextResponse.redirect(waitlistUrl);
  }
  
  // Allow authenticated users to access protected routes
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/waitlist (API route for waitlist)
     * 2. /api/auth (NextAuth.js API route)
     * 3. /waitlist (waitlist page)
     * 4. /auth/* (login/registration pages)
     * 5. /_next (Next.js internals)
     * 6. /static (static files)
     * 7. /fonts (font files)
     * 8. /favicon.ico (favicon file)
     */
    '/((?!api/waitlist|api/auth|waitlist|auth|_next|static|fonts|favicon.ico).*)',
  ],
};
