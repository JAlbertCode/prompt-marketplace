'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';
import { TrendingUp, Book, Zap } from 'lucide-react';

interface EarningMetrics {
  totalEarnings: number;
  monthlyEarnings: number;
  totalPromptUses: number;
  totalFlowUses: number;
  totalFlowUnlocks: number;
}

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EarningMetrics>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalPromptUses: 0,
    totalFlowUses: 0,
    totalFlowUnlocks: 0,
  });

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/creator');
      return;
    }

    // For demonstration purposes, set some example metrics
    // In production, this would fetch data from API
    if (status === 'authenticated') {
      // Simulate API fetch
      setTimeout(() => {
        setMetrics({
          totalEarnings: 50000, // 50,000 credits = $0.05
          monthlyEarnings: 15000, // 15,000 credits = $0.015
          totalPromptUses: 25,
          totalFlowUses: 12,
          totalFlowUnlocks: 3,
        });
        setLoading(false);
      }, 1000);
    }
  }, [status, router]);

  // Format credits as dollar amount
  const formatCreditsToUsd = (credits: number) => {
    const usd = credits * 0.000001;
    return `${usd.toFixed(6)}`;
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Define creator navigation tabs
  const creatorTabs = [
    { href: '/dashboard/creator', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/content', label: 'My Content', icon: Book },
  ];

  return (
    <div>
      <PageHeader 
        title="Creator Dashboard"
        description="Track your earnings and prompt/flow usage metrics"
        tabs={creatorTabs}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(metrics.totalEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(metrics.totalEarnings)} USD
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">This Month</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(metrics.monthlyEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(metrics.monthlyEarnings)} USD
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Usage Stats</h2>
          <p className="text-xl font-medium">
            {formatNumber(metrics.totalPromptUses)} prompt uses
          </p>
          <p className="text-xl font-medium">
            {formatNumber(metrics.totalFlowUses)} flow uses
          </p>
          <p className="text-xl font-medium">
            {formatNumber(metrics.totalFlowUnlocks)} flow unlocks
          </p>
        </ContentCard>
      </div>

      <ContentCard title="Your Content" className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full">
            <h3 className="text-lg font-medium mb-3">Your Content</h3>
            <div className="bg-gray-50 border rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No content created yet</p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/create?tab=prompt"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create a Prompt
                </a>
                <a
                  href="/create?tab=flow"
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Create a Flow
                </a>
              </div>
            </div>
          </div>
        </div>
      </ContentCard>

      <ContentCard title="Recent Earnings">
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-500">No recent earnings to display</p>
          <p className="text-sm text-gray-500 mt-2">
            Earnings will appear here when users run your prompts or unlock your flows
          </p>
        </div>
      </ContentCard>
    </div>
  );
}
