import React, { useState, useEffect } from 'react';
import { getUserTransactions } from '@/utils/creditManager';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  type: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface TransactionHistoryProps {
  userId: string;
  initialPage?: number;
  pageSize?: number;
}

export default function TransactionHistory({
  userId,
  initialPage = 1,
  pageSize = 10,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 0,
    page: initialPage,
    limit: pageSize,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions(initialPage);
  }, [userId, initialPage, pageSize]);

  const fetchTransactions = async (page: number) => {
    try {
      setLoading(true);
      const response = await getUserTransactions(userId, page, pageSize);
      setTransactions(response.transactions);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load transaction history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) {
      return;
    }
    fetchTransactions(newPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT_PURCHASE':
        return 'text-green-600';
      case 'PROMPT_RUN':
      case 'FLOW_RUN':
      case 'FLOW_UNLOCK':
        return 'text-red-600';
      case 'CREATOR_PAYMENT':
        return 'text-blue-600';
      case 'REFUND':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'CREDIT_PURCHASE':
        return 'Purchase';
      case 'PROMPT_RUN':
        return 'Prompt Run';
      case 'FLOW_RUN':
        return 'Flow Run';
      case 'FLOW_UNLOCK':
        return 'Flow Unlock';
      case 'CREATOR_PAYMENT':
        return 'Creator Payment';
      case 'REFUND':
        return 'Refund';
      default:
        return type;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm text-red-700 underline"
            onClick={() => fetchTransactions(pagination.page)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-gray-500">
          <p>No transaction history found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.description}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} credits
                  <div className="text-xs text-gray-500">
                    {formatCreditsToDollars(transaction.amount)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 text-sm bg-white border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
