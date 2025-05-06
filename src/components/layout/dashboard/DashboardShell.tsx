"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  LayoutDashboard, 
  Settings, 
  Zap, 
  History,
  TrendingUp,
  Sparkles
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
      label: 'Credits', 
      href: '/dashboard/credits', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
    { 
      label: 'Creator Tools', 
      href: '/dashboard/creator', 
      icon: <Sparkles className="h-5 w-5" /> 
    },
    { 
      label: 'Settings', 
      href: '/settings', 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];
  
  // Determine if we're in the credits section
  const isCreditsSection = pathname?.startsWith('/dashboard/credits');
  
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
          
          {/* Quick run button */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/run"
              className="flex items-center justify-center w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Zap className="h-5 w-5 mr-2" />
              <span className="font-medium">Run Prompt</span>
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
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Credits sidebar - Only visible when in credits section */}
          {isCreditsSection && (
            <div className="w-full md:w-64 p-4 md:border-r md:border-gray-200">
              <CreditsSidebar />
            </div>
          )}
          
          {/* Main content */}
          <main className={`flex-1 p-4 md:p-6 ${isCreditsSection ? 'md:ml-0' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
