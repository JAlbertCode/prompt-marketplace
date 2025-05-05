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
import { formatCredits } from '@/lib/creditHelpers';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Purchase Credits - PromptFlow',
  description: 'Purchase credits to run prompts and flows on PromptFlow',
};

async function getMonthlyBurn(userId: string): Promise<number> {
  // Calculate 30-day credit burn from transaction history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
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
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Purchase Credits</h1>
        <p className="text-gray-600">
          Purchase credits to run prompts and flows. 1 credit = $0.000001 USD.
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Current Credit Balance</h2>
            <p className="text-gray-600">Available for running prompts and flows</p>
          </div>
          <div className="md:text-right mt-2 md:mt-0">
            <p className="text-3xl font-bold text-blue-600">
              {formatCredits(creditBalance)}
            </p>
            <p className="text-sm text-gray-500">
              = ${(creditBalance * 0.000001).toFixed(6)} USD
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Monthly Usage</h3>
          <p className="text-gray-700 mb-1">
            Credits used in the last 30 days: <span className="font-medium">{monthlyBurn.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-500">
            Some credit packages have minimum monthly usage requirements
          </p>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Credit Packages</h2>
        <CreditBundlesGrid monthlyBurn={monthlyBurn} />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 font-semibold">Date</th>
                  <th className="p-2 font-semibold">Model</th>
                  <th className="p-2 font-semibold">Credits</th>
                  <th className="p-2 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200">
                    <td className="p-2">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {transaction.model?.displayName || transaction.modelId}
                    </td>
                    <td className="p-2 font-medium">
                      {transaction.creditsUsed.toLocaleString()}
                    </td>
                    <td className="p-2">
                      {transaction.itemType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent transactions</p>
        )}
        
        <div className="mt-4 text-center">
          <a 
            href="/dashboard/credits/history" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full Transaction History
          </a>
        </div>
      </div>
    </div>
  );
}
