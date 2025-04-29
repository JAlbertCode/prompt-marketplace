'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCreditStore } from '@/store/useCreditStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { toast } from 'react-hot-toast';

const Header: React.FC = () => {
  const { credits, addCredits } = useCreditStore();
  const { favorites } = useFavoriteStore();
  const pathname = usePathname();
  const isLowCredits = credits < 200;
  
  // Check if a navigation link is active
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  // Add 1000 credits for testing
  const handleAddTestCredits = () => {
    addCredits(1000, 'Test credit addition');
    toast.success('Added 1000 test credits!');
  };
  
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
              className={`text-sm font-medium px-3 py-2 rounded-md ${isActive('/') 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Browse
            </Link>
            
            <Link 
              href="/favorites"
              className={`text-sm font-medium px-3 py-2 rounded-md flex items-center ${isActive('/favorites') 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              <span>Favorites</span>
              {Array.isArray(favorites) && favorites.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            <Link 
              href="/submit"
              className={`text-sm font-medium px-3 py-2 rounded-md ${isActive('/submit') 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}`}
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
            
            <button
              onClick={handleAddTestCredits}
              className="ml-2 text-xs px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Test: Add Credits
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
