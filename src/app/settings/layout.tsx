"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Settings, Shield, CreditCard, Home } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';
import { getUserTotalCredits } from '@/lib/credits';
import DashboardNav from '@/components/layout/DashboardNav';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  
  // Fetch user's credits
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const fetchCredits = async () => {
        try {
          const totalCredits = await getUserTotalCredits(session.user.id);
          setCredits(totalCredits);
        } catch (error) {
          console.error('Error fetching credits:', error);
        }
      };
      
      fetchCredits();
    }
  }, [status, session?.user?.id]);
  
  // Define sidebar navigation items
  const sidebarItems = [
    { 
      href: '/settings/profile', 
      label: 'Profile', 
      icon: User,
      description: 'Manage your personal information'
    },
    { 
      href: '/settings/account', 
      label: 'Account', 
      icon: Settings,
      description: 'Configure account preferences' 
    },
    { 
      href: '/settings/security', 
      label: 'Security', 
      icon: Shield,
      description: 'Update password and security settings'
    },
    {
      href: '/dashboard/credits',
      label: 'Credits',
      icon: CreditCard,
      description: 'Manage your credit balance'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include the same dashboard navigation for consistency */}
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              {/* User info */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
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
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Credits button */}
              <div className="p-4 border-b border-gray-200">
                <CreditsButton credits={credits} className="w-full" />
              </div>
              
              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
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
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
