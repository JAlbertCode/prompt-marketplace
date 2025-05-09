"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard, 
  Bell,
  Key,
  RefreshCw
} from 'lucide-react';
import { getUserTotalCredits } from '@/lib/credits';
import { formatCredits } from '@/lib/creditHelpers';

// Settings navigation items
const settingsNavItems = [
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
    description: 'Update account settings'
  },
  {
    href: '/settings/security',
    label: 'Security',
    icon: Shield,
    description: 'Protect your account'
  },
  {
    href: '/settings/notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Communication preferences'
  },
  {
    href: '/settings/api-keys',
    label: 'API Keys',
    icon: Key,
    description: 'Manage your API access'
  }
];

export default function SettingsSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user credits when component loads
  useEffect(() => {
    async function fetchCredits() {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const totalCredits = await getUserTotalCredits(session.user.id);
          setCredits(totalCredits);
        } catch (error) {
          console.error('Error fetching credits:', error);
          // Set to 0 on error to avoid showing loading indefinitely
          setCredits(0);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchCredits();
  }, [session]);
  
  // Format USD value from credits
  const creditsToUSD = (creditAmount: number) => {
    return (creditAmount * 0.000001).toFixed(creditAmount >= 1_000_000 ? 2 : 6);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* User profile section */}
      {session?.user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-lg font-bold">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{session.user.name || 'User'}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation links */}
      <nav className="p-2">
        {settingsNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md my-1 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Credits info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Available Credits</span>
          <button 
            onClick={() => setLoading(true)}
            className="text-gray-400 hover:text-gray-600"
            title="Refresh credit balance"
            disabled={loading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="text-xl font-bold text-blue-600">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading...</span>
            </div>
          ) : credits !== null ? (
            <>
              {formatCredits(credits)}
              <div className="text-xs font-normal text-blue-600/70">
                ${creditsToUSD(credits)} USD
              </div>
            </>
          ) : (
            'Error loading'
          )}
        </div>
        
        <Link 
          href="/dashboard/credits"
          className="mt-3 w-full flex items-center justify-center py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Manage Credits
        </Link>
      </div>
    </div>
  );
}
