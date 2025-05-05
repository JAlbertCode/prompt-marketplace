"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardNav from '../DashboardNav';
import { User, CreditCard } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

export default function AppShell({ 
  children, 
  sidebar,
  pageTitle,
  pageDescription
}: AppShellProps) {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global navigation */}
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        {pageTitle && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-gray-600 mt-1">{pageDescription}</p>
            )}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar if provided */}
          {sidebar && (
            <div className="md:w-64 flex-shrink-0">{sidebar}</div>
          )}
          
          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
