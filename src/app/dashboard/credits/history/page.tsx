/**
 * Credit Transaction History Page
 * 
 * This page displays a detailed history of a user's credit transactions,
 * including credits used, earned, and purchased.
 */

import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getUserCreditHistory, getUserCreditBreakdown } from '@/lib/credits';
import { formatCredits } from '@/lib/creditHelpers';

export const metadata = {
  title: 'Transaction History - PromptFlow',
  description: 'View your PromptFlow credit transaction history',
};

// Helper to get stripe payment history
async function getStripePayments(userId: string) {
  try {
    const stripePurchases = await prisma.creditBucket.findMany({
      where: {
        userId,
        type: 'purchased',
        source: {
          startsWith: 'stripe_payment:',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return stripePurchases;
  } catch (error) {
    console.error('Error fetching Stripe payments:', error);
    return [];
  }
}

export default async function TransactionHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string };
}) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits/history');
  }
  
  // Parse query parameters
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const transactionType = searchParams.type || 'all';
  
  // Get user ID from session
  const userId = session.user.id;
  
  // Get credit transactions
  const transactions = await getUserCreditHistory(userId, pageSize, offset);
  
  // Get total count for pagination
  const totalCount = await prisma.creditTransaction.count({
    where: {
      OR: [
        { userId },
        { creatorId: userId },
      ],
    },
  });
  
  // Get current credit breakdown
  const creditBreakdown = await getUserCreditBreakdown(userId);
  const totalCredits = Object.values(creditBreakdown).reduce((a, b) => a + b, 0);
  
  // Get Stripe purchase history
  const stripePayments = await getStripePayments(userId);
  
  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Convert credits to USD
  const creditsToUsd = (credits: number) => {
    return (credits * 0.000001).toFixed(6);
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Credit Transaction History</h1>
        <p className="text-gray-600">
          Track your credit usage and purchases
        </p>
      </div>
      
      {/* Credit Breakdown */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Current Credit Balance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Credits</h3>
            <p className="text-2xl font-bold">{formatCredits(totalCredits)}</p>
            <p className="text-xs text-gray-500">${creditsToUsd(totalCredits)} USD</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Purchased</h3>
            <p className="text-2xl font-bold">{formatCredits(creditBreakdown.purchased)}</p>
            <p className="text-xs text-gray-500">${creditsToUsd(creditBreakdown.purchased)} USD</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Bonus</h3>
            <p className="text-2xl font-bold">{formatCredits(creditBreakdown.bonus)}</p>
            <p className="text-xs text-gray-500">${creditsToUsd(creditBreakdown.bonus)} USD</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Referral</h3>
            <p className="text-2xl font-bold">{formatCredits(creditBreakdown.referral)}</p>
            <p className="text-xs text-gray-500">${creditsToUsd(creditBreakdown.referral)} USD</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <a 
            href="/dashboard/credits" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Purchase More Credits
          </a>
        </div>
      </div>
      
      {/* Transaction Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <a 
          href="/dashboard/credits/history"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            transactionType === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All Transactions
        </a>
        <a 
          href="/dashboard/credits/history?type=used"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            transactionType === 'used' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Credits Used
        </a>
        <a 
          href="/dashboard/credits/history?type=earned"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            transactionType === 'earned' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Credits Earned
        </a>
        <a 
          href="/dashboard/credits/history?type=purchased"
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            transactionType === 'purchased' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Purchases
        </a>
      </div>
      
      {/* Transaction History */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          {transactionType === 'purchased' 
            ? 'Purchase History' 
            : transactionType === 'earned' 
              ? 'Earned Credits History'
              : transactionType === 'used'
                ? 'Used Credits History'
                : 'All Transactions'}
        </h2>
        
        {transactionType === 'purchased' ? (
          // Show Stripe purchase history
          stripePayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="p-2 font-semibold">Date</th>
                    <th className="p-2 font-semibold">Amount</th>
                    <th className="p-2 font-semibold">Payment ID</th>
                    <th className="p-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stripePayments.map((payment) => {
                    const paymentId = payment.source.replace('stripe_payment:', '');
                    
                    return (
                      <tr key={payment.id} className="border-b border-gray-200">
                        <td className="p-2">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="p-2 font-medium">
                          {payment.amount.toLocaleString()} credits
                        </td>
                        <td className="p-2 text-gray-600">
                          {paymentId.slice(0, 12)}...
                        </td>
                        <td className="p-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Completed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No purchase history found</p>
          )
        ) : (
          // Show regular transaction history
          transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-100">
                    <th className="p-2 font-semibold">Date</th>
                    <th className="p-2 font-semibold">Model</th>
                    <th className="p-2 font-semibold">Credits</th>
                    <th className="p-2 font-semibold">Type</th>
                    <th className="p-2 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    // Determine if this is a credit earned or used transaction
                    const isEarned = tx.creatorId === userId;
                    const creditsDisplay = isEarned 
                      ? `+${(tx.creditsUsed * (tx.creatorFeePercentage / 100) * 0.8).toLocaleString()}`
                      : `-${tx.creditsUsed.toLocaleString()}`;
                    
                    // Skip if filtering by type
                    if ((transactionType === 'earned' && !isEarned) || 
                        (transactionType === 'used' && isEarned)) {
                      return null;
                    }
                    
                    return (
                      <tr key={tx.id} className="border-b border-gray-200">
                        <td className="p-2">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="p-2">
                          {tx.model?.displayName || tx.modelId}
                        </td>
                        <td className={`p-2 font-medium ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
                          {creditsDisplay}
                        </td>
                        <td className="p-2">
                          {isEarned ? 'Creator Fee' : tx.itemType}
                        </td>
                        <td className="p-2 text-gray-600">
                          {isEarned 
                            ? `$${creditsToUsd(tx.creditsUsed * (tx.creatorFeePercentage / 100) * 0.8)}`
                            : `$${creditsToUsd(tx.creditsUsed)}`
                          }
                        </td>
                      </tr>
                    );
                  }).filter(Boolean)}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No transaction history found</p>
          )
        )}
      </div>
      
      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {page > 1 && (
              <a
                href={`/dashboard/credits/history?page=${page - 1}${transactionType !== 'all' ? `&type=${transactionType}` : ''}`}
                className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200"
              >
                Previous
              </a>
            )}
            
            <span className="px-4 py-2 bg-white rounded-md text-gray-600">
              Page {page} of {Math.ceil(totalCount / pageSize)}
            </span>
            
            {page < Math.ceil(totalCount / pageSize) && (
              <a
                href={`/dashboard/credits/history?page=${page + 1}${transactionType !== 'all' ? `&type=${transactionType}` : ''}`}
                className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
