'use client';

import React from 'react';
import Link from 'next/link';
import { useCreditStore } from '@/store/useCreditStore';

const Header: React.FC = () => {
  const { credits } = useCreditStore();
  const isLowCredits = credits < 200;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center text-blue-600 font-bold text-xl"
            >
              <span className="mr-2">🔍</span>
              <span>Sonar Prompt Marketplace</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse
            </Link>
            
            <Link 
              href="/submit"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Create Prompt
            </Link>
            
            {/* Credit display */}
            <div className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${isLowCredits 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
              }
            `}>
              {isLowCredits && (
                <span className="mr-1">⚠️</span>
              )}
              <span>{credits} Credits</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
