"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Define types
type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for user on initial load
  useEffect(() => {
    const checkUser = async () => {
      try {
        // First check localStorage for user info
        const storedUser = localStorage.getItem('supabase_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // If not in localStorage, check with Supabase
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Get user profile from the database
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (profile) {
              setUser(profile);
              localStorage.setItem('supabase_user', JSON.stringify(profile));
            } else {
              setUser({
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name
              });
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase_user');
      localStorage.removeItem('supabase_session');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
