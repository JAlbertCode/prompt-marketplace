'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // For debugging
    console.log('Root page loading, redirecting to /home');
    
    // Just redirect to home
    router.push('/home');
  }, [router]);
  
  // Show loading until client-side redirect happens
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}