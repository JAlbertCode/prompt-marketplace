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
    pages: {
      signIn: '/login',
    },
  }
);

// Configure which paths the middleware runs on - only protect pages that require authentication
export const config = {
  matcher: [
    // Routes that require authentication
    '/dashboard/:path*',
    '/settings/:path*',
    '/create/:path*', 
    '/run/execute/:path*', // Only protect execution, not the preview
    '/favorites/:path*',
  ],
};
