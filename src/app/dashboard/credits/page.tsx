/**
 * Credits Purchase Page
 * 
 * This page allows users to purchase credit bundles using Stripe
 */

import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserTotalCredits, getUserCreditHistory } from '@/lib/credits';
import CreditBundlesGrid from '@/components/payments/CreditBundlesGrid';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';
import { formatCredits } from '@/lib/creditHelpers';
import { prisma } from '@/lib/db';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Purchase Credits - PromptFlow',
  description: 'Purchase credits to run prompts and flows on PromptFlow',
};

async function getMonthlyBurn(userId: string): Promise<number> {
  // Calculate 30-day credit burn from transaction history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    
    // Sum all credits used in the last 30 days
    return transactions.reduce((total, transaction) => {
      return total + transaction.creditsUsed;
    }, 0);
  } catch (error) {
    console.error("Error calculating monthly burn:", error);
    return 0; // Default to 0 if there's an error
  }
}

export default async function CreditsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits');
  }
  
  // Get user's current credit balance
  const userId = session.user.id;
  const creditBalance = await getUserTotalCredits(userId);
  const monthlyBurn = await getMonthlyBurn(userId);
  
  // Get recent transactions
  const recentTransactions = await getUserCreditHistory(userId, 5);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Define credit tabs - use string identifiers instead of component references
  const creditTabs = [
    { href: '/dashboard/credits', label: 'Purchase Credits', iconName: 'credit-card' },
    { href: '/dashboard/credits/history', label: 'Transaction History', iconName: 'history' },
    { href: '/dashboard/credits/usage', label: 'Usage Analytics', iconName: 'trending-up' },
  ];
  
  // Create credit display component for the page header
  const creditDisplay = (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">Available Credits</div>
      <div className="text-2xl font-bold text-blue-600">{formatCredits(creditBalance)}</div>
      <div className="text-xs text-gray-500">= ${(creditBalance * 0.000001).toFixed(6)} USD</div>
    </div>
  );
  
  return (
    <div>
      <PageHeader 
        title="Purchase Credits"
        description="Purchase credits to run prompts and flows. 1 credit = $0.000001 USD."
        tabs={creditTabs}
        rightContent={creditDisplay}
      />
      
      <ContentCard 
        title="Monthly Usage"
        className="mb-8"
      >
        <p className="text-gray-700 mb-1">
          Credits used in the last 30 days: <span className="font-medium">{monthlyBurn.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-500">
          Some credit packages have minimum monthly usage requirements
        </p>
        
        <div className="mt-4">
          <Link 
            href="/dashboard/credits/usage" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View detailed usage analytics <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </ContentCard>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Credit Packages</h2>
        <CreditBundlesGrid monthlyBurn={monthlyBurn} />
      </div>
      
      <ContentCard title="Recent Transactions">
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Model</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Credits</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {transaction.model?.displayName || transaction.modelId || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {transaction.creditsUsed.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {transaction.itemType || 'Usage'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No recent transactions</p>
            <p className="text-sm text-gray-400 mt-2">
              Transactions will appear here when you use credits with models
            </p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link 
            href="/dashboard/credits/history" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Transaction History
          </Link>
        </div>
      </ContentCard>
    </div>
  );
}
