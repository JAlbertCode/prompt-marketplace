"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';

interface SidebarProps {
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    requiresAdmin?: boolean;
  }[];
  showUserProfile?: boolean;
  showCredits?: boolean;
  credits?: number;
}

export default function Sidebar({ 
  items,
  showUserProfile = true,
  showCredits = true,
  credits 
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Filter items based on user role
  const filteredItems = items.filter(item => 
    !item.requiresAdmin || session?.user?.role === 'ADMIN'
  );
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* User profile section */}
      {showUserProfile && session?.user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {session.user.email || ''}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Credits section */}
      {showCredits && (
        <div className="p-4 border-b border-gray-200">
          <CreditsButton credits={credits} className="w-full" />
        </div>
      )}
      
      {/* Navigation items */}
      <nav className="p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
