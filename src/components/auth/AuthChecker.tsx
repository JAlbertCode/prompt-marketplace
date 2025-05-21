'use client';

import { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { toast } from 'react-hot-toast';

interface AuthenticationCheckerProps {
  children: ReactNode;
  redirectTo?: string;
  showToast?: boolean;
  isPublicPage?: boolean;
}

/**
 * A component that verifies authentication status and redirects if necessary
 * 
 * @param children Content to render if authentication check passes
 * @param redirectTo Where to redirect if authentication check fails (defaults to /login)
 * @param showToast Whether to show a toast notification on redirection
 * @param isPublicPage If true, checks if user is already authenticated
 */
export default function AuthenticationChecker({
  children,
  redirectTo,
  showToast = false,
  isPublicPage = false
}: AuthenticationCheckerProps) {
  const { data: session, status: nextAuthStatus } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Wait for both auth systems to finish loading
    if (nextAuthStatus === 'loading' || supabaseLoading) {
      return;
    }
    
    // Check authentication methods
    // 1. Next.js Auth session
    const hasSession = !!session?.user;
    
    // 2. Supabase Auth user
    const hasSupabaseUser = !!supabaseUser;
    
    // 3. Check localStorage for Supabase user
    const storedUser = typeof window !== 'undefined' 
      ? localStorage.getItem('supabase_user') 
      : null;
    
    // 4. Check cookies for supabase_auth
    const authCookie = typeof document !== 'undefined' 
      ? document.cookie.includes('supabase_auth=true') 
      : false;
    
    // Debug info
    console.log('[AuthChecker] Authentication status:', {
      nextAuthStatus,
      hasSession,
      hasSupabaseUser,
      hasStoredUser: !!storedUser,
      hasAuthCookie: authCookie
    });
    
    const isAuthenticated = hasSession || hasSupabaseUser || !!storedUser || authCookie;
    
    if (isPublicPage) {
      // For public pages, we don't need to redirect if not authenticated
      // But we might want to redirect to dashboard if already authenticated
      if (isAuthenticated && redirectTo) {
        router.replace(redirectTo);
      }
    } else {
      // For protected pages, redirect if not authenticated
      if (!isAuthenticated) {
        // Prepare redirect URL with return path
        const currentPath = encodeURIComponent(window.location.pathname);
        const redirectPath = redirectTo || `/login?returnUrl=${currentPath}`;
        
        if (showToast) {
          toast.error('Please sign in to continue');
        }
        
        router.replace(redirectPath);
      }
    }
  }, [
    nextAuthStatus, 
    supabaseLoading, 
    session, 
    supabaseUser, 
    router, 
    redirectTo,
    showToast,
    isPublicPage
  ]);
  
  return <>{children}</>;
}