'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditCard } from 'lucide-react';
import { getUserTotalCredits } from '@/lib/credits';

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  
  // Fetch user credits when component loads
  useEffect(() => {
    if (session?.user?.id) {
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
  }, [session]);
  
  // Define navigation items based on user role
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', showAlways: true },
    { label: 'Credits', href: '/dashboard/credits', showAlways: true },
    { label: 'Creator Tools', href: '/dashboard/creator', showAlways: true }, // Everyone is a creator
    { label: 'Admin', href: '/admin/dashboard', requiresAdmin: true },
    { label: 'Settings', href: '/settings', showAlways: true },
  ].filter(item => 
    item.showAlways || 
    (item.requiresAdmin && session?.user?.role === 'ADMIN')
  );
  
  if (!session) {
    return null;
  }
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <div className="flex overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-5 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Credits display */}
          {session && (
            <Link 
              href="/dashboard/credits"
              className="flex items-center py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              <span>{credits !== undefined ? credits.toLocaleString() : '...'} Credits</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
