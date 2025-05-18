/**
 * Helper functions for server-side authentication
 */

import { cookies, headers } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Check if the user is authenticated, using both NextAuth and Supabase
 * @returns {Promise<{isAuthenticated: boolean, userId?: string}>}
 */
export async function checkServerAuth() {
  // First try NextAuth
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    return {
      isAuthenticated: true,
      userId: session.user.id,
      user: session.user
    };
  }
  
  // If not authenticated with NextAuth, try with Supabase
  // Just check for a Supabase auth cookie existence
  try {
    // Get the auth cookie - in Next.js 15, headers() should be awaited before accessing its properties
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    const hasSupabaseAuth = cookieHeader.includes('supabase_auth=true');
    
    if (hasSupabaseAuth) {
      // We're authenticated with Supabase, but we don't know the user ID
      // Just return a generic authenticated state
      return {
        isAuthenticated: true,
        userId: 'unknown', // This will be filled in client-side
        user: {
          id: 'unknown',
          name: 'Supabase User',
          email: 'user@example.com'
        }
      };
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
  
  // Not authenticated with either method
  return {
    isAuthenticated: false
  };
}

/**
 * Simplified version that just returns current user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { isAuthenticated, userId } = await checkServerAuth();
  return isAuthenticated && userId ? userId : null;
}
