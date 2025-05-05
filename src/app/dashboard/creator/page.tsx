'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    return `$${usd.toFixed(6)}`;
  };

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-600">
          Track your earnings and prompt/flow usage metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(metrics.totalEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(metrics.totalEarnings)} USD
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">This Month</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatNumber(metrics.monthlyEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(metrics.monthlyEarnings)} USD
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
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
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Content</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-medium mb-3">Your Prompts</h3>
            <div className="bg-gray-50 border rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No prompts created yet</p>
              <a
                href="/create/prompt"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create a Prompt
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-medium mb-3">Your Flows</h3>
            <div className="bg-gray-50 border rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">No flows created yet</p>
              <a
                href="/create/flow"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create a Flow
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Earnings</h2>
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <p className="text-gray-500">No recent earnings to display</p>
          <p className="text-sm text-gray-500 mt-2">
            Earnings will appear here when users run your prompts or unlock your flows
          </p>
        </div>
      </div>
    </div>
  );
}
