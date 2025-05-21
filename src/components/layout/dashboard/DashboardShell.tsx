"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  Sparkles,
  User,
  FileText,
  Zap
} from 'lucide-react';
import CreditsSidebar from './CreditsSidebar';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  
  // Define main navigation items
  const mainNavItems = [
    { 
      label: 'Overview', 
      href: '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      label: 'Prompts', 
      href: '/dashboard/prompts', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      label: 'Flows', 
      href: '/dashboard/flows', 
      icon: <Zap className="h-5 w-5" /> 
    },
    { 
      label: 'Creator Tools', 
      href: '/dashboard/creator', 
      icon: <Sparkles className="h-5 w-5" /> 
    },
    { 
      label: 'Credits', 
      href: '/dashboard/credits', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];
  
  // Determine if we're in the credits section
  const isCreditsSection = pathname?.startsWith('/dashboard/credits');
  
  // Determine if we're in the settings section
  const isSettingsSection = pathname?.startsWith('/settings');
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">PromptFlow</h1>
            <p className="text-sm text-gray-500">AI Prompt Marketplace</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {mainNavItems.map((item) => {
              // Consider a nav item active if:
              // 1. It's the exact path, or
              // 2. It's a section root (like /dashboard) and the path starts with it, or
              // 3. It's a section (like /settings) and the path starts with it
              const isActive = 
                item.href === pathname || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User profile section */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/settings/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium text-gray-900">Profile</div>
                <div className="text-xs text-gray-500">Edit account settings</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header - Visible on small screens */}
        <div className="md:hidden bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">PromptFlow</h1>
            {/* Mobile menu button would go here */}
          </div>
        </div>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
