'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits, creditsToUSD } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  model?: {
    displayName: string;
  };
  description: string;
  source?: string;
}

interface CreditTransactionHistoryProps {
  userId: string;
  limit?: number;
  showPagination?: boolean;
}

const CreditTransactionHistory: React.FC<CreditTransactionHistoryProps> = ({
  userId,
  limit = 10,
  showPagination = true
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `/api/credits/transactions?userId=${userId}&page=${currentPage}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch transaction history');
        }
        
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalTransactions(data.total);
        setError(null);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
        setError('Could not load transaction history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [userId, currentPage, limit]);
  
  // Format date as "May 4, 2025"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'PROMPT_RUN':
        return 'Prompt Run';
      case 'FLOW_RUN':
        return 'Flow Run';
      case 'CREATOR_PAYMENT':
        return 'Creator Payment';
      case 'CREDIT_PURCHASE':
        return 'Credit Purchase';
      case 'AUTOMATION_BONUS':
        return 'Automation Bonus';
      default:
        return type.replace(/_/g, ' ').toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };
  
  // Get total pages for pagination
  const totalPages = Math.ceil(totalTransactions / limit);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between border-b border-gray-100 pb-3">
              <div className="w-2/3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-1/3 flex justify-end">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <p className="text-blue-700">
            No transaction history available. Start using the platform to see your credit usage.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      
      <div className="space-y-4">
        {transactions.map(transaction => {
          const isNegative = transaction.amount < 0;
          const formattedAmount = `${isNegative ? '-' : '+'} ${formatCredits(Math.abs(transaction.amount))}`;
          
          return (
            <div 
              key={transaction.id}
              className="flex justify-between border-b border-gray-100 pb-3"
            >
              <div>
                <div className="font-medium">
                  {formatTransactionType(transaction.type)}
                  {transaction.model && ` • ${transaction.model.displayName}`}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(transaction.createdAt)}
                  {transaction.source && ` • ${transaction.source}`}
                </div>
                {transaction.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {transaction.description}
                  </div>
                )}
              </div>
              
              <div className={`font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {formattedAmount}
              </div>
            </div>
          );
        })}
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalTransactions)} of {totalTransactions} transactions
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditTransactionHistory;