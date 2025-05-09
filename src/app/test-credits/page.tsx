'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreditBucket {
  id: string;
  userId: string;
  type: string;
  amount: number;
  remaining: number;
  source: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  type: string;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  credits: number;
}

export default function TestCreditsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditData, setCreditData] = useState<{
    user: UserData;
    creditBuckets: CreditBucket[];
    transactions: Transaction[];
    totalCredits: number;
    creditBreakdown: Record<string, number>;
  } | null>(null);
  
  const [addingCredits, setAddingCredits] = useState(false);
  const [amount, setAmount] = useState(10000);
  
  const router = useRouter();
  
  useEffect(() => {
    fetchCreditData();
  }, []);
  
  const fetchCreditData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-credits');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch credit data');
      }
      
      const data = await response.json();
      setCreditData(data);
    } catch (error) {
      console.error('Error fetching credit data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch credit data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCredits = async () => {
    try {
      setAddingCredits(true);
      
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          type: 'bonus',
          source: 'test_page',
          expiryDays: 30
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add credits');
      }
      
      // Refresh data
      await fetchCreditData();
      
      alert(`Successfully added ${amount} credits!`);
    } catch (error) {
      console.error('Error adding credits:', error);
      alert(error instanceof Error ? error.message : 'Failed to add credits');
    } finally {
      setAddingCredits(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4">Loading credit data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (!creditData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No credit data available</p>
      </div>
    );
  }
  
  const { user, creditBuckets, transactions, totalCredits, creditBreakdown } = creditData;
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const formatCreditsToUSD = (credits: number) => {
    const usd = credits * 0.000001;
    return `$${usd.toFixed(6)}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Credit System Test Page</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">User Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Name:</span> {user.name || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {user.email || 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-medium">Legacy Credits:</span> {formatNumber(user.credits)}</p>
            <p><span className="font-medium">Total Credits (New System):</span> {formatNumber(totalCredits)}</p>
            <p><span className="font-medium">Value:</span> {formatCreditsToUSD(totalCredits)}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Credit Breakdown</h2>
          
          <div className="space-y-4">
            {Object.entries(creditBreakdown).map(([type, amount]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="font-medium capitalize">{type}:</span>
                <span>{formatNumber(amount)} credits</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Add Test Credits</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block mb-1 font-medium">Amount:</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-sm text-gray-500 mt-1">
                Value: {formatCreditsToUSD(amount)}
              </p>
            </div>
            
            <button
              onClick={handleAddCredits}
              disabled={addingCredits}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {addingCredits ? 'Adding...' : 'Add Credits'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Credit Buckets</h2>
          
          {creditBuckets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Type</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Remaining</th>
                    <th className="p-2">Source</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {creditBuckets.map((bucket) => (
                    <tr key={bucket.id} className="border-b border-gray-200">
                      <td className="p-2 capitalize">{bucket.type}</td>
                      <td className="p-2">{formatNumber(bucket.amount)}</td>
                      <td className="p-2">{formatNumber(bucket.remaining)}</td>
                      <td className="p-2">{bucket.source}</td>
                      <td className="p-2">{formatDate(bucket.createdAt)}</td>
                      <td className="p-2">{bucket.expiresAt ? formatDate(bucket.expiresAt) : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No credit buckets found</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-200">
                      <td className="p-2">{formatDate(tx.createdAt)}</td>
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">{formatNumber(tx.amount)}</td>
                      <td className="p-2">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No transactions found</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
