import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/layout/dashboard/DashboardShell';
import SettingsSidebar from '@/components/layout/settings/SettingsSidebar';

export const metadata: Metadata = {
  title: 'Settings - PromptFlow',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings');
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
