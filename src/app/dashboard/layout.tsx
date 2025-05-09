import React from 'react';
import { Metadata } from 'next';
import DashboardShell from '@/components/layout/dashboard/DashboardShell';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard - PromptFlow',
  description: 'Manage your prompts, flows, and credits on PromptFlow',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard');
  }
  
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
