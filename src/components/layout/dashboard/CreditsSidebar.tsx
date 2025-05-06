"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  CreditCard, 
  History, 
  TrendingUp, 
  Tag, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatCredits } from '@/lib/creditHelpers';
import { getUserTotalCredits } from '@/lib/credits';

// Credit navigation items
const creditNavItems = [
  {
    href: '/dashboard/credits',
    label: 'Overview',
    icon: CreditCard
  },
  {
    href: '/dashboard/credits/usage',
    label: 'Usage Analytics',
    icon: TrendingUp
  },
  {
    href: '/dashboard/credits/history',
    label: 'Transaction History',
    icon: History
  },
  {
    href: '/dashboard/credits/pricing',
    label: 'Model Pricing',
    icon: Tag
  },
  {
    href: '/dashboard/credits/recurring',
    label: 'Recurring Credits',
    icon: Clock,
    beta: true
  }
];

export default function CreditsSidebar() {
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
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-900">Credits</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your PromptFlow credits
        </p>
      </div>
      
      <nav className="p-2">
        {creditNavItems.map((item) => {
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
              <span className="flex-1">{item.label}</span>
              
              {item.beta && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  Beta
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
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
          Purchase Credits
        </Link>
      </div>
    </div>
  );
}
