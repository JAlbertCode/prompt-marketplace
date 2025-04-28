import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/layout/ClientLayout';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sonar Prompt Marketplace | Run and Create Optimized AI Prompts',
  description: 'Browse, run, and create optimized AI prompts powered by Perplexity Sonar API. Discover ready-to-use prompts or create your own with our easy-to-use interface.',
  keywords: 'AI prompts, Perplexity, Sonar API, prompt marketplace, AI tools, prompt engineering',
  authors: [{ name: 'Sonar Prompt Marketplace Team' }],
  openGraph: {
    title: 'Sonar Prompt Marketplace | Run and Create Optimized AI Prompts',
    description: 'Browse, run, and create optimized AI prompts powered by Perplexity Sonar API.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
