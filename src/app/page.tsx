'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if authenticated on client-side
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      
      // If authenticated, redirect to home
      if (authStatus) {
        router.push('/home');
      } else {
        // Otherwise redirect to waitlist
        router.push('/waitlist');
      }
    }
  }, [router]);
  
  // Show loading until client-side redirect happens
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}