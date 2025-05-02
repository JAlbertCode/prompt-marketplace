import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Export the middleware function
export default withAuth(
  // `withAuth` augments your Request with the user's token
  function middleware(request) {
    // Continue on by default
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authenticated
    },
  }
);

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Routes that require authentication
    '/dashboard/:path*',
    '/create/:path*',
    '/settings/:path*',
    '/favorites/:path*',
    
    // Exclude public routes and API routes
    '/((?!api|login|register|_next/static|_next/image|favicon.ico).*)',
  ],
};
