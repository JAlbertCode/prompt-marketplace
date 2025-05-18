'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const HeaderWrapper: React.FC = () => {
  const nextAuthSession = useSession();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  
  useEffect(() => {
    // Check for Supabase auth on mount
    const checkSupabaseAuth = async () => {
      try {
        // First check localStorage
        const storedUser = localStorage.getItem('supabase_user');
        const storedSession = localStorage.getItem('supabase_session');
        
        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          setSupabaseUser(user);
          
          // Set cookies to ensure server-side auth works
          document.cookie = `supabase_auth=true; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax`;
          return;
        }
        
        // If not in localStorage, check with Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setSupabaseUser(user);
          
          // Store in localStorage for future use
          localStorage.setItem('supabase_user', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0]
          }));
          
          // Set cookies to ensure server-side auth works
          document.cookie = `supabase_auth=true; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax`;
        }
      } catch (error) {
        console.error('Error checking Supabase auth:', error);
      }
    };
    
    checkSupabaseAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
          };
          setSupabaseUser(userData);
          localStorage.setItem('supabase_user', JSON.stringify(userData));
          localStorage.setItem('supabase_session', JSON.stringify({
            token: session.access_token,
            expires: session.expires_at
          }));
          
          // Set cookies to ensure server-side auth works
          document.cookie = `supabase_auth=true; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax`;
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          localStorage.removeItem('supabase_user');
          localStorage.removeItem('supabase_session');
          
          // Clear auth cookies
          document.cookie = `supabase_auth=; path=/; max-age=0; SameSite=Lax`;
          document.cookie = `isAuthenticated=; path=/; max-age=0; SameSite=Lax`;
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Create a merged session object that checks both NextAuth and Supabase
  const combinedSession = {
    data: nextAuthSession.data || (supabaseUser ? { 
      user: {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        email: supabaseUser.email,
        image: null
      }
    } : null),
    status: nextAuthSession.status === 'authenticated' || supabaseUser ? 'authenticated' : 
           nextAuthSession.status === 'loading' ? 'loading' : 'unauthenticated'
  };

  return <Header session={combinedSession.data} status={combinedSession.status} />;
};

export default HeaderWrapper;
