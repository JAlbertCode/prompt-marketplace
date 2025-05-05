/**
 * Creator Dashboard
 * 
 * This page shows creators their earnings, usage statistics for their prompts/flows,
 * and allows them to track their revenue from the PromptFlow platform.
 */

import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Creator Dashboard - PromptFlow',
  description: 'Track your earnings and prompt usage on PromptFlow',
};

async function getCreatorStats(userId: string) {
  // Get all credit transactions where user is the creator
  const transactions = await prisma.creditTransaction.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      model: {
        select: {
          displayName: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Calculate total earnings (80% of creator fees)
  const totalEarnings = transactions.reduce((sum, tx) => {
    const creatorFee = tx.creditsUsed * (tx.creatorFeePercentage / 100);
    const creatorShare = creatorFee * 0.8; // Creator gets 80%
    return sum + creatorShare;
  }, 0);
  
  // Get owned prompts with usage stats
  const ownedPrompts = await prisma.prompt.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      _count: {
        select: {
          usageEvents: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  
  // Get owned flows with usage stats
  const ownedFlows = await prisma.flow.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      _count: {
        select: {
          usageEvents: true,
          unlocks: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  
  // Calculate total usage of prompts and flows
  const totalPromptUsage = ownedPrompts.reduce((sum, prompt) => sum + prompt._count.usageEvents, 0);
  const totalFlowUsage = ownedFlows.reduce((sum, flow) => sum + flow._count.usageEvents, 0);
  const totalFlowUnlocks = ownedFlows.reduce((sum, flow) => sum + flow._count.unlocks, 0);
  
  // Get monthly stats
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthlyTransactions = transactions.filter(tx => 
    new Date(tx.createdAt) >= startOfMonth
  );
  
  const monthlyEarnings = monthlyTransactions.reduce((sum, tx) => {
    const creatorFee = tx.creditsUsed * (tx.creatorFeePercentage / 100);
    const creatorShare = creatorFee * 0.8; // Creator gets 80%
    return sum + creatorShare;
  }, 0);
  
  // Get flow unlocks (one-time payments for premium flows)
  const flowUnlocks = await prisma.flowUnlock.findMany({
    where: {
      flow: {
        creatorId: userId,
      },
    },
    include: {
      flow: {
        select: {
          title: true,
          unlockPrice: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  // Calculate unlock revenue (80% of unlock prices)
  const unlockRevenue = flowUnlocks.reduce((sum, unlock) => {
    const creatorShare = (unlock.flow.unlockPrice || 0) * 0.8; // Creator gets 80%
    return sum + creatorShare;
  }, 0);
  
  return {
    totalEarnings,
    monthlyEarnings,
    unlockRevenue,
    totalPromptUsage,
    totalFlowUsage,
    totalFlowUnlocks,
    ownedPrompts,
    ownedFlows,
    recentTransactions: transactions.slice(0, 10),
    recentUnlocks: flowUnlocks,
  };
}

export default async function CreatorDashboardPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/creator');
  }
  
  const userId = session.user.id;
  const stats = await getCreatorStats(userId);
  
  // Format credits as string with commas
  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };
  
  // Convert credits to USD
  const creditsToUsd = (credits: number) => {
    return (credits * 0.000001).toFixed(6);
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
        <p className="text-gray-600">
          Track your earnings and prompt usage on PromptFlow
        </p>
      </div>
      
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCredits(stats.totalEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = ${creditsToUsd(stats.totalEarnings)} USD
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">This Month</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCredits(stats.monthlyEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = ${creditsToUsd(stats.monthlyEarnings)} USD
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Premium Unlocks</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCredits(stats.unlockRevenue)} credits
          </p>
          <p className="text-sm text-gray-500">
            = ${creditsToUsd(stats.unlockRevenue)} USD
          </p>
        </div>
      </div>
      
      {/* Usage Stats */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Usage Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-1">Prompt Runs</h3>
            <p className="text-2xl font-bold">{stats.totalPromptUsage}</p>
            <p className="text-sm text-gray-500">
              Across {stats.ownedPrompts.length} prompts
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-1">Flow Runs</h3>
            <p className="text-2xl font-bold">{stats.totalFlowUsage}</p>
            <p className="text-sm text-gray-500">
              Across {stats.ownedFlows.length} flows
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-1">Flow Unlocks</h3>
            <p className="text-2xl font-bold">{stats.totalFlowUnlocks}</p>
            <p className="text-sm text-gray-500">
              Premium flows purchased
            </p>
          </div>
        </div>
      </div>
      
      {/* Recent Earnings */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Earnings</h2>
        
        {stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 font-semibold">Date</th>
                  <th className="p-2 font-semibold">User</th>
                  <th className="p-2 font-semibold">Model</th>
                  <th className="p-2 font-semibold">Fee %</th>
                  <th className="p-2 font-semibold">Credits Used</th>
                  <th className="p-2 font-semibold">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx) => {
                  const creatorFee = tx.creditsUsed * (tx.creatorFeePercentage / 100);
                  const creatorShare = creatorFee * 0.8; // Creator gets 80%
                  
                  return (
                    <tr key={tx.id} className="border-b border-gray-200">
                      <td className="p-2">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {tx.user?.name || 'Unknown User'}
                      </td>
                      <td className="p-2">
                        {tx.model?.displayName || tx.modelId}
                      </td>
                      <td className="p-2">
                        {tx.creatorFeePercentage}%
                      </td>
                      <td className="p-2">
                        {formatCredits(tx.creditsUsed)}
                      </td>
                      <td className="p-2 font-medium">
                        {formatCredits(creatorShare)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent earnings</p>
        )}
      </div>
      
      {/* Recent Unlocks */}
      {stats.recentUnlocks.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Flow Unlocks</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 font-semibold">Date</th>
                  <th className="p-2 font-semibold">User</th>
                  <th className="p-2 font-semibold">Flow</th>
                  <th className="p-2 font-semibold">Unlock Price</th>
                  <th className="p-2 font-semibold">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUnlocks.map((unlock) => {
                  const unlockPrice = unlock.flow.unlockPrice || 0;
                  const creatorShare = unlockPrice * 0.8; // Creator gets 80%
                  
                  return (
                    <tr key={unlock.id} className="border-b border-gray-200">
                      <td className="p-2">
                        {new Date(unlock.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {unlock.user?.name || 'Unknown User'}
                      </td>
                      <td className="p-2">
                        {unlock.flow.title}
                      </td>
                      <td className="p-2">
                        {formatCredits(unlockPrice)}
                      </td>
                      <td className="p-2 font-medium">
                        {formatCredits(creatorShare)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Owned Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Prompts */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Prompts</h2>
          
          {stats.ownedPrompts.length > 0 ? (
            <div className="space-y-4">
              {stats.ownedPrompts.map((prompt) => (
                <div key={prompt.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{prompt.title}</h3>
                      <p className="text-sm text-gray-500">
                        {prompt.isPublished ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{prompt._count.usageEvents} runs</p>
                      <p className="text-xs text-gray-500">Created {new Date(prompt.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't created any prompts yet</p>
          )}
          
          <div className="mt-4">
            <a 
              href="/create/prompt" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors text-sm"
            >
              Create New Prompt
            </a>
          </div>
        </div>
        
        {/* Flows */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Flows</h2>
          
          {stats.ownedFlows.length > 0 ? (
            <div className="space-y-4">
              {stats.ownedFlows.map((flow) => (
                <div key={flow.id} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{flow.title}</h3>
                      <p className="text-sm text-gray-500">
                        {flow.isPublished ? 'Published' : 'Draft'}
                        {flow.unlockPrice ? ` • ${formatCredits(flow.unlockPrice)} credits to unlock` : ' • Free'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{flow._count.usageEvents} runs</p>
                      <p className="text-xs text-gray-500">{flow._count.unlocks} unlocks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't created any flows yet</p>
          )}
          
          <div className="mt-4">
            <a 
              href="/create/flow" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors text-sm"
            >
              Create New Flow
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
