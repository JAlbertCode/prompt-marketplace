/**
 * Admin Dashboard
 * 
 * This page provides administrative controls and metrics for the PromptFlow platform.
 * Only accessible to users with admin role.
 */

import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Admin Dashboard - PromptFlow',
  description: 'Platform administration for PromptFlow',
};

async function getAdminStats() {
  // Get user metrics
  const userCount = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: {
      lastLogin: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
  });
  
  // Get content metrics
  const promptCount = await prisma.prompt.count();
  const publishedPromptCount = await prisma.prompt.count({
    where: {
      isPublished: true,
    },
  });
  
  const flowCount = await prisma.flow.count();
  const publishedFlowCount = await prisma.flow.count({
    where: {
      isPublished: true,
    },
  });
  
  // Get transaction metrics
  const creditTransactions = await prisma.creditTransaction.findMany({
    select: {
      creditsUsed: true,
      createdAt: true,
      modelId: true,
    },
  });
  
  // Calculate total credits burned
  const totalCreditsBurned = creditTransactions.reduce(
    (sum, tx) => sum + tx.creditsUsed,
    0
  );
  
  // Calculate monthly credit burn
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthlyCreditsBurned = creditTransactions
    .filter((tx) => new Date(tx.createdAt) >= startOfMonth)
    .reduce((sum, tx) => sum + tx.creditsUsed, 0);
  
  // Get model usage breakdown
  const modelUsage = creditTransactions.reduce((acc, tx) => {
    const modelId = tx.modelId;
    if (!acc[modelId]) {
      acc[modelId] = 0;
    }
    acc[modelId] += tx.creditsUsed;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort model usage by credits burned
  const sortedModelUsage = Object.entries(modelUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  // Get revenue metrics (one-time payments like flow unlocks)
  const flowUnlocks = await prisma.flowUnlock.findMany({
    include: {
      flow: {
        select: {
          unlockPrice: true,
        },
      },
    },
  });
  
  const unlockRevenue = flowUnlocks.reduce(
    (sum, unlock) => sum + (unlock.flow.unlockPrice || 0),
    0
  );
  
  // Platform's share is 20%
  const platformUnlockRevenue = unlockRevenue * 0.2;
  
  // Calculate platform's share of transaction fees (10-15% markup)
  // This is a simplification - in reality would be calculated from the actual fee structure
  const platformTransactionRevenue = totalCreditsBurned * 0.12; // Using 12% as average markup
  
  const totalPlatformRevenue = platformUnlockRevenue + platformTransactionRevenue;
  
  // Get recent credit purchases
  const recentCreditPurchases = await prisma.creditBucket.findMany({
    where: {
      type: 'purchased',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  return {
    userMetrics: {
      total: userCount,
      active: activeUsers,
    },
    contentMetrics: {
      prompts: promptCount,
      publishedPrompts: publishedPromptCount,
      flows: flowCount,
      publishedFlows: publishedFlowCount,
    },
    creditMetrics: {
      totalBurned: totalCreditsBurned,
      monthlyBurn: monthlyCreditsBurned,
      topModels: sortedModelUsage,
    },
    revenueMetrics: {
      unlockRevenue,
      platformUnlockRevenue,
      platformTransactionRevenue,
      totalPlatformRevenue,
    },
    recentPurchases: recentCreditPurchases,
  };
}

export default async function AdminDashboardPage() {
  // Check authentication and admin role
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/admin/dashboard');
  }
  
  // Check for admin role
  if (!session.user.isAdmin) {
    redirect('/dashboard'); // Redirect non-admins
  }
  
  const stats = await getAdminStats();
  
  // Format numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Format credits to USD
  const creditsToUsd = (credits: number) => {
    return (credits * 0.000001).toFixed(2);
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Platform statistics and administration for PromptFlow
        </p>
      </div>
      
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{formatNumber(stats.userMetrics.total)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(stats.userMetrics.active)} active in last 30 days
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Content</h2>
          <p className="text-3xl font-bold">
            {formatNumber(stats.contentMetrics.publishedPrompts + stats.contentMetrics.publishedFlows)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(stats.contentMetrics.publishedPrompts)} prompts, {formatNumber(stats.contentMetrics.publishedFlows)} flows
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Credits Burned</h2>
          <p className="text-3xl font-bold">{formatNumber(stats.creditMetrics.totalBurned)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {formatNumber(stats.creditMetrics.monthlyBurn)} this month
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Platform Revenue</h2>
          <p className="text-3xl font-bold">${creditsToUsd(stats.revenueMetrics.totalPlatformRevenue)}</p>
          <p className="text-sm text-gray-600 mt-1">
            Fees: ${creditsToUsd(stats.revenueMetrics.platformTransactionRevenue)}, Unlocks: ${creditsToUsd(stats.revenueMetrics.platformUnlockRevenue)}
          </p>
        </div>
      </div>
      
      {/* Model Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Models by Usage</h2>
          
          <div className="space-y-4">
            {stats.creditMetrics.topModels.map(([modelId, credits]) => (
              <div key={modelId} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{modelId}</h3>
                  <p className="text-sm text-gray-500">
                    ${creditsToUsd(credits)} USD in revenue
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatNumber(credits)}</p>
                  <p className="text-xs text-gray-500">credits burned</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Revenue Breakdown</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Transaction Fees</h3>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Total Credits Burned:</p>
                <p className="font-bold">{formatNumber(stats.creditMetrics.totalBurned)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Platform's Share (est. 12%):</p>
                <p className="font-bold">{formatNumber(stats.revenueMetrics.platformTransactionRevenue)}</p>
              </div>
              <div className="flex justify-between items-center text-blue-600">
                <p className="font-medium">USD Value:</p>
                <p className="font-bold">${creditsToUsd(stats.revenueMetrics.platformTransactionRevenue)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Flow Unlocks</h3>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Total Unlock Revenue:</p>
                <p className="font-bold">{formatNumber(stats.revenueMetrics.unlockRevenue)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Platform's Share (20%):</p>
                <p className="font-bold">{formatNumber(stats.revenueMetrics.platformUnlockRevenue)}</p>
              </div>
              <div className="flex justify-between items-center text-blue-600">
                <p className="font-medium">USD Value:</p>
                <p className="font-bold">${creditsToUsd(stats.revenueMetrics.platformUnlockRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Credit Purchases */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Credit Purchases</h2>
        
        {stats.recentPurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 font-semibold">Date</th>
                  <th className="p-2 font-semibold">User</th>
                  <th className="p-2 font-semibold">Credits</th>
                  <th className="p-2 font-semibold">Source</th>
                  <th className="p-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-200">
                    <td className="p-2">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {purchase.user?.name || 'Unknown User'}
                    </td>
                    <td className="p-2 font-medium">
                      {formatNumber(purchase.amount)}
                    </td>
                    <td className="p-2">
                      {purchase.source}
                    </td>
                    <td className="p-2">
                      ${creditsToUsd(purchase.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent credit purchases</p>
        )}
      </div>
      
      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="space-y-3">
            <a href="/admin/users" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Manage Users
            </a>
            <a href="/admin/users/roles" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Manage Roles
            </a>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Content Management</h2>
          <div className="space-y-3">
            <a href="/admin/content/prompts" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Manage Prompts
            </a>
            <a href="/admin/content/flows" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Manage Flows
            </a>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Platform Settings</h2>
          <div className="space-y-3">
            <a href="/admin/settings/models" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Manage Models
            </a>
            <a href="/admin/settings/credits" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Credit Settings
            </a>
            <a href="/admin/settings/payment" className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium transition-colors">
              Payment Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
