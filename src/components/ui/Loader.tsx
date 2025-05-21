'use client';

import React from 'react';

type LoaderSize = 'small' | 'medium' | 'large';

interface LoaderProps {
  size?: LoaderSize;
  message?: string;
  className?: string;
}

/**
 * Loading spinner component for consistent loading states
 */
export default function Loader({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '' 
}: LoaderProps) {
  const sizeClass = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full ${sizeClass[size]} border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent`}
      />
      
      {message && (
        <p className="text-gray-600 mt-3 text-sm">{message}</p>
      )}
    </div>
  );
}