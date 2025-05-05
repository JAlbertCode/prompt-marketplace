"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Settings, Shield, CreditCard } from 'lucide-react';
import { getUserTotalCredits } from '@/lib/credits';
import AppShell from '@/components/layout/system/AppShell';
import Sidebar from '@/components/layout/system/Sidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { data: session, status } = useSession();
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
    },
    { 
      href: '/settings/account', 
      label: 'Account', 
      icon: Settings,
    },
    { 
      href: '/settings/security', 
      label: 'Security', 
      icon: Shield,
    },
    {
      href: '/dashboard/credits',
      label: 'Credits',
      icon: CreditCard,
    }
  ];
  
  const settingsSidebar = (
    <Sidebar
      items={sidebarItems}
      showUserProfile={true}
      showCredits={true}
      credits={credits}
    />
  );

  return (
    <AppShell
      sidebar={settingsSidebar}
    >
      <div className="bg-white rounded-lg shadow p-6">
        {children}
      </div>
    </AppShell>
  );
}
