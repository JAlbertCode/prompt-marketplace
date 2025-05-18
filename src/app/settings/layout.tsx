import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardShell from '@/components/layout/dashboard/DashboardShell';
import SettingsSidebar from '@/components/layout/settings/SettingsSidebar';
import { checkServerAuth, redirectToLogin } from '@/lib/auth/helpers/serverAuth';

export const metadata: Metadata = {
  title: 'Settings - PromptFlow',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication using our helper
  const { isAuthenticated } = await checkServerAuth();
  
  // Check for Supabase auth cookie explicitly - needs await in Next.js 15
  const cookieStore = await cookies();
  const supabaseAuth = cookieStore.get('supabase_auth');
  const isAuthenticatedByCookie = supabaseAuth && supabaseAuth.value === 'true';
  
  if (!isAuthenticated && !isAuthenticatedByCookie) {
    return redirectToLogin('/settings');
  }
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 mb-6 md:mb-0">
          <SettingsSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {children}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
