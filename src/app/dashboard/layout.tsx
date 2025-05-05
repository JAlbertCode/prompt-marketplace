import React from 'react';
import { Metadata } from 'next';
import DashboardNav from '@/components/layout/DashboardNav';

export const metadata: Metadata = {
  title: 'Dashboard - PromptFlow',
  description: 'Manage your prompts, flows, and credits on PromptFlow',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main>{children}</main>
    </div>
  );
}
