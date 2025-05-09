import React, { useEffect, useState } from 'react';
import { getModelById } from '@/lib/models/modelRegistry';

interface CreditTransaction {
  id: string;
  userId: string;
  creatorId?: string;
  modelId: string;
  creditsUsed: number;
  creatorFeePercentage: number;
  promptLength: 'short' | 'medium' | 'long';
  createdAt: string;
  itemType?: 'prompt' | 'flow' | 'completion';
  itemId?: string;
  model?: {
    displayName: string;
  };
  creator?: {
    id: string;
    name: string;
    image?: string;
  };
  user?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface CreditHistoryProps {
  userId?: string;
  limit?: number;
}

const CreditHistory: React.FC<CreditHistoryProps> = ({ userId, limit = 10 }) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        
        if (userId) {
          queryParams.append('userId', userId);
        }
        
        const response = await fetch(`/api/credits/history?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch credit history');
        }
        
        const data = await response.json();
        setTransactions(data.data);
      } catch (error) {
        console.error('Error fetching credit history:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch credit history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [userId, page, limit]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getTransactionType = (transaction: CreditTransaction) => {
    if (transaction.creatorId && transaction.creatorId === userId) {
      return 'Creator Earnings';
    }
    
    if (transaction.itemType === 'prompt') {
      return 'Prompt Run';
    }
    
    if (transaction.itemType === 'flow') {
      return 'Flow Run';
    }
    
    return 'Model Completion';
  };
  
  const getModelName = (modelId: string) => {
    const model = getModelById(modelId);
    return model ? model.displayName : modelId;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-md">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-600">
        <p className="font-medium">Error loading credit history</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-gray-600 text-center">
        <p>No credit transactions found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Credit History</h3>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{getTransactionType(transaction)}</p>
                <p className="text-sm text-gray-600">
                  Model: {transaction.model?.displayName || getModelName(transaction.modelId)}
                </p>
                {transaction.creatorId && transaction.creatorId !== userId && (
                  <p className="text-sm text-gray-600">
                    Creator: {transaction.creator?.name || 'Unknown'}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
              
              <div className={`font-medium ${transaction.creatorId === userId ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.creatorId === userId ? '+' : '-'}
                {transaction.creditsUsed.toLocaleString()} credits
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-600">Page {page}</span>
        
        <button
          onClick={() => setPage(page + 1)}
          disabled={transactions.length < limit}
          className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CreditHistory;