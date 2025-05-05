"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  CreditCard, 
  ArrowDown,
  ArrowUp,
  DownloadCloud
} from 'lucide-react';
import CreditPageHeader from '@/components/credits/CreditPageHeader';
import { getUserTotalCredits, getUserCreditHistory } from '@/lib/credits';

// Transaction Type Badge
function TransactionTypeBadge({ type }: { type: string }) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'purchased':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Purchase' };
      case 'bonus':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Bonus' };
      case 'prompt':
      case 'completion':
        return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Usage' };
      case 'flow':
        return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Flow' };
      case 'creator_payment':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Creator Payment' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    }
  };
  
  const config = getTypeConfig(type);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default function CreditHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;
  
  // Load user data and transaction history
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/dashboard/credits/history');
    }
    
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        try {
          // Get total credits
          const totalCredits = await getUserTotalCredits(session.user.id);
          setCredits(totalCredits);
          
          // Get transaction history
          const history = await getUserCreditHistory(
            session.user.id,
            pageSize,
            0
          );
          
          setTransactions(history);
          setHasMore(history.length === pageSize);
          setLoading(false);
        } catch (error) {
          console.error('Error loading credit data:', error);
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [status, router, session?.user?.id]);
  
  // Load more transactions
  const loadMore = async () => {
    if (!session?.user?.id || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const offset = (nextPage - 1) * pageSize;
      
      const moreTransactions = await getUserCreditHistory(
        session.user.id,
        pageSize,
        offset
      );
      
      if (moreTransactions.length > 0) {
        setTransactions([...transactions, ...moreTransactions]);
        setPage(nextPage);
        setHasMore(moreTransactions.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <CreditPageHeader 
        title="Credit Transaction History" 
        description="View and manage your credit transactions"
        credits={credits}
      />
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Filters (placeholder for future implementation) */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>All Time</span>
          </div>
          
          <button className="ml-auto flex items-center text-sm text-gray-600 px-3 py-1 border rounded-md hover:bg-gray-50">
            <DownloadCloud className="w-4 h-4 mr-1" />
            <span>Export</span>
          </button>
        </div>
        
        {/* Transaction list */}
        {loading && transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-pulse w-12 h-12 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Loading transaction history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No transaction history found</p>
            <button 
              onClick={() => router.push('/dashboard/credits')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Purchase Credits
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Model</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <TransactionTypeBadge type={transaction.itemType || 'usage'} />
                      </td>
                      <td className="px-4 py-3">
                        {transaction.model?.displayName || transaction.modelId || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium flex items-center justify-end">
                        {transaction.userId === session?.user?.id && transaction.creditsUsed > 0 ? (
                          <span className="flex items-center text-red-600">
                            <ArrowDown className="w-3 h-3 mr-1" />
                            {transaction.creditsUsed.toLocaleString()}
                          </span>
                        ) : (
                          <span className="flex items-center text-green-600">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {transaction.creditsUsed.toLocaleString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Load more button */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-200">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
