"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';

interface CreditsButtonProps {
  credits?: number;
  variant?: 'default' | 'minimal' | 'icon';
  className?: string;
}

export default function CreditsButton({ 
  credits, 
  variant = 'default',
  className = ''
}: CreditsButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/dashboard/credits');
  };
  
  // Format credits for display
  const formattedCredits = credits !== undefined 
    ? credits.toLocaleString()
    : '...';
  
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center px-3 py-1.5 text-sm rounded-md text-blue-600 hover:bg-blue-50 transition-colors ${className}`}
      >
        <CreditCard className="w-4 h-4 mr-1.5" />
        <span>{formattedCredits} credits</span>
      </button>
    );
  }
  
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        title="Manage Credits"
      >
        <CreditCard className="w-5 h-5 text-blue-600" />
      </button>
    );
  }
  
  return (
    <button
      onClick={handleClick}
      className={`flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${className}`}
    >
      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">{formattedCredits}</span>
        <span className="text-xs text-gray-500">Credits</span>
      </div>
    </button>
  );
}
