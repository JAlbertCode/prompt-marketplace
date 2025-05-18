import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

import { Redis } from '@upstash/redis';

// Use Redis-based rate limiting for production, memory-based for development
let ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
let redis: Redis | null = null;

// Initialize Redis if configuration is available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    // Dynamic import to avoid bundling issues
    import('@upstash/redis').then(({ Redis }) => {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    }).catch(err => {
      console.error('Failed to initialize Redis:', err);
    });
  } catch (error) {
    console.error('Error importing Redis:', error);
  }
}

/**
 * Apply rate limiting based on IP address
 * Uses Redis in production and memory cache in development
 */
async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  // Only rate limit API routes
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/api/')) return null;
  
  // Skip rate limiting for authentication endpoints and health checks
  if (path.startsWith('/api/auth') || path === '/api/health') return null;
  
  // Get the real IP address
  const ip = request.ip || 
             request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             'unknown';
  
  // Get rate limit config from env or use defaults
  const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10);
  const WINDOW_SECONDS = parseInt(process.env.RATE_LIMIT_WINDOW || '60', 10);
  
  // Use different rate limiting strategies based on environment
  const now = Date.now();
  
  // If Redis is available (production), use it for rate limiting
  if (redis) {
    try {
      // Use Redis for persistent rate limiting
      const rateKey = `ratelimit:${ip}:${Math.floor(now / (WINDOW_SECONDS * 1000))}`;
      
      // Increment count and get current value atomically
      const count = await redis.incr(rateKey);
      
      // Set expiration if first request in window
      if (count === 1) {
        await redis.expire(rateKey, WINDOW_SECONDS);
      }
      
      // Get time to reset
      const ttl = await redis.ttl(rateKey);
      
      // If over limit, return rate limit response
      if (count > MAX_REQUESTS) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': MAX_REQUESTS.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (Math.floor(now / 1000) + ttl).toString(),
              'Retry-After': ttl.toString(),
            },
          }
        );
      }
      
      // Under limit, proceed with request
      return null;
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fall back to in-memory rate limiting
    }
  }
  
  // In-memory rate limiting (for development or if Redis fails)
  const resetTime = now + (WINDOW_SECONDS * 1000);
  
  // Initialize or update request tracking for this IP
  if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
    ipRequestCounts[ip] = { count: 1, resetTime };
    return null; // First request in window, allow
  }
  
  // Increment counter
  ipRequestCounts[ip].count++;
  
  // If over limit, return rate limit response
  if (ipRequestCounts[ip].count > MAX_REQUESTS) {
    const timeToReset = Math.ceil((ipRequestCounts[ip].resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${timeToReset} seconds.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(ipRequestCounts[ip].resetTime / 1000).toString(),
          'Retry-After': timeToReset.toString(),
        },
      }
    );
  }
  
  return null; // Under limit, allow
}

export async function middleware(request: NextRequest) {
  // Create a Supabase client for middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Refresh session if expired
  await supabase.auth.getSession();
  
  // Apply rate limiting for API routes
  const rateLimitResponse = await applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Get current path
  const path = request.nextUrl.pathname;

  // Public paths that should always be accessible
  const publicPaths = [
    '/',
    '/waitlist',
    '/api/waitlist',
    '/api/auth',
    '/api/health', // Health check endpoint
    '/api/cron',   // Cron jobs with proper verification
    '/auth',       // Auth endpoints including callback
    '/login',
    '/register',
    '/signout',    // Add signout path
    '/reset-password', // Add reset password path
    '/_next',
    '/static',
    '/assets',
    '/fonts',
    '/favicon.ico',
    '/ping',
    '/health',
    '/robots.txt',
    '/sitemap.xml',
  ];
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // If path is public, allow access
  if (isPublicPath) {
    const response = NextResponse.next();
    
    // Apply security headers to all responses
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Prevent caching of API responses
    if (path.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  }

  // Verify cron job requests (if from Vercel)
  if (path.startsWith('/api/cron/')) {
    const cronSecret = request.headers.get('x-vercel-cron');
    if (cronSecret) {
      // Vercel automatically adds this header for cron jobs
      const response = NextResponse.next();
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      return response;
    }
  }

  // Check for authentication from multiple sources
  const cookieStore = await request.cookies;
  const authCookie = cookieStore.get('auth');
  const sessionCookie = cookieStore.get('next-auth.session-token') || 
                      cookieStore.get('__Secure-next-auth.session-token');
  const supabaseAuthCookie = cookieStore.get('supabase_auth');
  const supabaseAuthValue = supabaseAuthCookie?.value === 'true';
  
  // Get Supabase auth status
  const { data: { session: supabaseSession } } = await supabase.auth.getSession();
  
  // If user has any authentication method, allow access
  if (authCookie?.value === 'true' || sessionCookie || supabaseAuthValue || supabaseSession) {
    const response = NextResponse.next();
    
    // Apply security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  // Otherwise, redirect to login
  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('returnUrl', path);
  return NextResponse.redirect(redirectUrl);
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static assets and specific excluded paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
