"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  Settings, 
  BarChart3, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { signOut } from 'next-auth/react';

// Types for menu items
interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

export default function UserMenu({ userName, userImage }: { 
  userName: string;
  userImage?: string;
}) {
  const pathname = usePathname();
  
  // Define menu items for consistent navigation
  const menuItems: MenuItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'View your dashboard and prompts'
    },
    {
      href: '/dashboard/credits',
      label: 'Credits',
      icon: CreditCard,
      description: 'Manage your credit balance'
    },
    {
      href: '/dashboard/creator',
      label: 'Creator Tools',
      icon: FileText,
      description: 'Create and manage your prompts'
    },
    {
      href: '/settings/profile',
      label: 'Profile Settings',
      icon: User,
      description: 'Edit your profile information'
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      description: 'Manage your account settings'
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs">
      {/* User info */}
      <div className="flex items-center mb-4 p-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-2 text-gray-500" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{userName}</h3>
          <p className="text-sm text-gray-500">Manage your account</p>
        </div>
      </div>
      
      {/* Menu items */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-md w-full text-left transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
