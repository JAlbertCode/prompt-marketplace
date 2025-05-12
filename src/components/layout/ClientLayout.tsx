'use client';

import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSession } from 'next-auth/react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  // Ensure consistent hydration
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Initialize authentication state if needed
    try {
      if (typeof window !== 'undefined') {
        // Check and set localStorage auth state based on session data
        const isAuthenticated = status === 'authenticated' && !!session?.user;
        localStorage.setItem('isAuthenticated', isAuthenticated ? 'true' : 'false');
        
        // Debug logging
        console.log('ClientLayout auth state:', { status, userId: session?.user?.id });
        
        // Ensure auth state is also saved in a cookie for server-side redirects
        // This helps with Vercel's redirect rules
        document.cookie = `isAuthenticated=${isAuthenticated ? 'true' : 'false'}; path=/; max-age=2592000`;
      }
    } catch (error) {
      console.error('LocalStorage access error:', error);
    }
    
    setMounted(true);
  }, [session, status]);
  
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
      <Header />
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
