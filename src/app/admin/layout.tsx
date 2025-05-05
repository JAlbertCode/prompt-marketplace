import React from 'react';
import { Metadata } from 'next';
import DashboardNav from '@/components/layout/DashboardNav';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Dashboard - PromptFlow',
  description: 'Platform administration for PromptFlow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has admin role
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/admin/login');
    return null;
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main>{children}</main>
    </div>
  );
}
