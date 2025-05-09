'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // For debugging
    console.log('Root page loading, checking auth state');
    
    // Check if authenticated on client-side
    try {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('isAuthenticated') === 'true';
        console.log('Auth status:', authStatus);
        
        // Force a direct navigation
        const destination = authStatus ? '/home' : '/waitlist';
        console.log('Navigating to:', destination);
        window.location.href = destination;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // In case of error, force navigation to waitlist
      window.location.href = '/waitlist';
    }
  }, []);
  
  // Show loading until client-side redirect happens
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}