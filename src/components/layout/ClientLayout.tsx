'use client';

import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  // Ensure consistent hydration
  const [mounted, setMounted] = useState(false);
  const [isSupabaseAuthenticated, setIsSupabaseAuthenticated] = useState(false);
  
  useEffect(() => {
    // Initialize authentication state if needed
    try {
      if (typeof window !== 'undefined') {
        // Check for Supabase auth
        const supabaseUser = localStorage.getItem('supabase_user');
        const supabaseAuth = supabaseUser ? true : false;
        setIsSupabaseAuthenticated(supabaseAuth);
        
        // Set auth state in localStorage and cookies
        localStorage.setItem('isAuthenticated', supabaseAuth ? 'true' : 'false');
        document.cookie = `isAuthenticated=${supabaseAuth ? 'true' : 'false'}; path=/; max-age=2592000`;
      }
    } catch (error) {
      console.error('LocalStorage access error:', error);
    }
    
    setMounted(true);
  }, []);
  
  // Show loading spinner while mounting
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderWrapper />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default ClientLayout;
