import React from 'react';
import { Metadata } from 'next';
import AppShell from '@/components/layout/system/AppShell';

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
    <AppShell>
      {children}
    </AppShell>
  );
}
