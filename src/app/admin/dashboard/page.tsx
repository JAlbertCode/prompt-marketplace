'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AdminMetrics {
  userCount: number;
  activeUsers: number;
  promptCount: number;
  publishedPrompts: number;
  flowCount: number;
  publishedFlows: number;
  totalCreditsBurned: number;
  monthlyCreditsBurned: number;
  revenue: {
    total: number;
    transactionFees: number;
    unlockRevenue: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    userCount: 0,
    activeUsers: 0,
    promptCount: 0,
    publishedPrompts: 0,
    flowCount: 0,
    publishedFlows: 0,
    totalCreditsBurned: 0,
    monthlyCreditsBurned: 0,
    revenue: {
      total: 0,
      transactionFees: 0,
      unlockRevenue: 0,
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/admin/dashboard');
      return;
    }

    // Check if user has admin role
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.replace('/dashboard');
        return;
      }

      // Simulate API fetch for admin metrics
      setTimeout(() => {
        setMetrics({
          userCount: 125,
          activeUsers: 78,
          promptCount: 87,
          publishedPrompts: 62,
          flowCount: 34,
          publishedFlows: 28,
          totalCreditsBurned: 5_850_000,
          monthlyCreditsBurned: 1_250_000,
          revenue: {
            total: 750000,
            transactionFees: 550000,
            unlockRevenue: 200000,
          },
        });
        setLoading(false);
      }, 1000);
    }
  }, [status, router, session]);

  // Format credits as dollar amount
  const formatCreditsToUsd = (credits: number) => {
    const usd = credits * 0.000001;
    return `$${usd.toFixed(2)}`;
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Platform statistics and administration for PromptFlow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Users</h2>
          <p className="text-3xl font-bold">{formatNumber(metrics.userCount)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(metrics.activeUsers)} active in last 30 days
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Content</h2>
          <p className="text-3xl font-bold">
            {formatNumber(metrics.publishedPrompts + metrics.publishedFlows)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(metrics.publishedPrompts)} prompts, {formatNumber(metrics.publishedFlows)} flows
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Credits Burned</h2>
          <p className="text-3xl font-bold">{formatNumber(metrics.totalCreditsBurned)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(metrics.monthlyCreditsBurned)} this month
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Platform Revenue</h2>
          <p className="text-3xl font-bold">{formatCreditsToUsd(metrics.revenue.total)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Fees: {formatCreditsToUsd(metrics.revenue.transactionFees)}, Unlocks: {formatCreditsToUsd(metrics.revenue.unlockRevenue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Models by Usage</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">gpt-4o</h3>
                <p className="text-sm text-gray-500">
                  {formatCreditsToUsd(2500000)} USD in revenue
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatNumber(2500000)}</p>
                <p className="text-xs text-gray-500">credits burned</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">gpt-4.1</h3>
                <p className="text-sm text-gray-500">
                  {formatCreditsToUsd(1800000)} USD in revenue
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatNumber(1800000)}</p>
                <p className="text-xs text-gray-500">credits burned</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">sonar-pro-medium</h3>
                <p className="text-sm text-gray-500">
                  {formatCreditsToUsd(950000)} USD in revenue
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatNumber(950000)}</p>
                <p className="text-xs text-gray-500">credits burned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm">
                <span className="font-medium">John Smith</span> purchased <span className="font-medium">Pro</span> credit bundle
              </p>
              <p className="text-xs text-gray-500">10 minutes ago</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Emma Warren</span> created a new flow: <span className="font-medium">Content Creator Pro</span>
              </p>
              <p className="text-xs text-gray-500">35 minutes ago</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm">
                <span className="font-medium">David Chen</span> unlocked <span className="font-medium">SEO Assistant</span> flow
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="space-y-3">
            <a 
              href="/admin/users" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Manage Users
            </a>
            <a 
              href="/admin/users/roles" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Manage Roles
            </a>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Content Management</h2>
          <div className="space-y-3">
            <a 
              href="/admin/content/prompts" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Manage Prompts
            </a>
            <a 
              href="/admin/content/flows" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Manage Flows
            </a>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <div className="space-y-3">
            <a 
              href="/admin/settings/models" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Manage Models
            </a>
            <a 
              href="/admin/settings/credits" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Credit Settings
            </a>
            <a 
              href="/admin/settings/payment" 
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors"
            >
              Payment Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
