'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCreditStore } from '@/store/useCreditStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import { toast } from 'react-hot-toast';
import { useSession, signOut } from 'next-auth/react';
import { logout as clearCustomAuth } from '@/lib/auth/authHelpers';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Header: React.FC = () => {
  const { credits, addCredits, fetchCredits } = useCreditStore();
  const { favorites } = useFavoriteStore();
  const pathname = usePathname();
  const isLowCredits = credits < 5000;
  const { data: session, status } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  
  // Refresh credits when component mounts or session changes
  React.useEffect(() => {
    if (status === 'authenticated') {
      // Always fetch the latest credits when the header loads
      fetchCredits();

      // Set up an interval to refresh credits regularly
      const intervalId = setInterval(() => {
        fetchCredits();
      }, 30000); // Every 30 seconds

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [status, fetchCredits]);
  
  // Check if a navigation link is active
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    // Clear custom auth first
    clearCustomAuth();
    
    // Then try next-auth signout
    try {
      await signOut({ callbackUrl: '/waitlist' });
    } catch (error) {
      // If next-auth fails, just redirect manually
      router.push('/waitlist');
    }
    
    toast.success('Signed out successfully');
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
              <span>PromptFlow Marketplace</span>
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
              href="/models"
              className={`text-sm font-medium px-3 py-2 rounded-md ${isActive('/models') 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}`}
            >
              Models
            </Link>
            
            <Link 
              href="/dashboard?tab=favoritePrompts"
              className={`text-sm font-medium px-3 py-2 rounded-md flex items-center ${pathname.startsWith('/dashboard') && pathname.includes('favorite') 
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
              href="/create"
              className={`text-sm font-medium px-3 py-2 rounded-md ${
                pathname.startsWith('/create') || pathname.startsWith('/submit')
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              Create
            </Link>
            
            {/* Credit display */}
            <Link
              href="/dashboard/credits"
              className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center
                ${isLowCredits 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }
              `}
            >
              <span>{credits.toLocaleString()} Credits</span>
            </Link>
            
            {!session && status !== 'loading' ? (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center focus:outline-none"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="User avatar"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {session?.user?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <p className="font-medium">{session?.user?.name}</p>
                        <p className="text-gray-500 truncate">{session?.user?.email}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;