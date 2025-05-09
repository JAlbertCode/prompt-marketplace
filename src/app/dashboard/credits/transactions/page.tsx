"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowUpCircle, 
  ArrowDownCircle,
  Clock,
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { getUserTransactions, getUserCredits } from '@/utils/creditManager';

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/credits/transactions');
    }
  }, [status, router]);

  // Fetch transactions
  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user's credit balance
        const userCredits = await getUserCredits(session.user.id);
        setCredits(userCredits);
        
        // Fetch transaction history
        const result = await getUserTransactions(session.user.id, page, pageSize);
        setTransactions(result.transactions);
        setPagination(result.pagination);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [session, status, page, pageSize]);

  // Format transaction date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format credit amount
  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `${amount < 0 ? '-' : '+'} ${absAmount.toLocaleString()} credits`;
  };

  // Get color class based on transaction type
  const getAmountColorClass = (amount: number) => {
    return amount < 0 ? 'text-red-600' : 'text-green-600';
  };

  // Loading or unauthenticated state
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Credit Transactions</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-1 text-sm">
            <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">{credits.toLocaleString()} credits</span>
              <span className="text-gray-500 text-xs">${(credits / 1000000).toFixed(6)}</span>
            </div>
          </div>
          <Link 
            href="/dashboard/credits" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Buy Credits
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Available Credits</p>
              <p className="text-2xl font-bold mt-1">
                {credits.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Dollar Value</p>
              <p className="text-2xl font-bold mt-1">
                ${(credits / 1000000).toFixed(4)}
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <ArrowUpCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Last Transaction</p>
              <p className="text-2xl font-bold mt-1">
                {transactions.length > 0 ? formatDate(transactions[0].createdAt) : 'None'}
              </p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading && transactions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getAmountColorClass(transaction.amount)}`}>
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          transaction.type === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'PROMPT_RUN' ? 'bg-purple-100 text-purple-800' :
                          transaction.type === 'FLOW_UNLOCK' ? 'bg-yellow-100 text-yellow-800' :
                          transaction.type === 'CREATOR_PAYMENT' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(page * pageSize, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}