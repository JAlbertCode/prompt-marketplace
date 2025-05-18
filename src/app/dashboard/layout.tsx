import React from 'react';
import { Metadata } from 'next';
import DashboardShell from '@/components/layout/dashboard/DashboardShell';
import { redirect } from 'next/navigation';
import { checkServerAuth } from '@/lib/auth/helpers/serverAuth';

export const metadata: Metadata = {
  title: 'Dashboard - PromptFlow',
  description: 'Manage your prompts, flows, and credits on PromptFlow',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication with both NextAuth and Supabase
  const { isAuthenticated } = await checkServerAuth();
  
  if (!isAuthenticated) {
    redirect('/login?returnUrl=/dashboard');
  }
  
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
