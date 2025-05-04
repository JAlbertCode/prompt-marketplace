'use client';

import React, { useState, useEffect } from 'react';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

// Test data
const TEST_USER_ID = 'user_123';
const TEST_CREATOR_ID = 'creator_456';
const TEST_PROMPT_ID = 'prompt_789';
const TEST_MODELS = ['gpt-4o', 'gpt-4', 'claude-3-sonnet'];

export default function TestCreditsPage() {
  const [userCredits, setUserCredits] = useState<number>(0);
  const [creatorCredits, setCreatorCredits] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>(TEST_MODELS[0]);
  const [creatorFee, setCreatorFee] = useState<number>(5000);
  const [testAmount, setTestAmount] = useState<number>(1000000);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Fetch initial credit balances
  useEffect(() => {
    fetchCredits();
    fetchTransactions();
  }, []);

  // Calculate cost breakdown when model or creatorFee changes
  useEffect(() => {
    calculateCost();
  }, [selectedModel, creatorFee]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      
      // Fetch user credits
      const userResponse = await fetch(`/api/credits/balance?userId=${TEST_USER_ID}`);
      const userData = await userResponse.json();
      
      // Fetch creator credits
      const creatorResponse = await fetch(`/api/credits/balance?userId=${TEST_CREATOR_ID}`);
      const creatorData = await creatorResponse.json();
      
      if (userData.success) {
        setUserCredits(userData.balance);
      }
      
      if (creatorData.success) {
        setCreatorCredits(creatorData.balance);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setMessage('Failed to fetch credit balances');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch user transactions
      const response = await fetch(`/api/credits/transactions?userId=${TEST_USER_ID}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    try {
      // Use your real API endpoint for calculating costs
      const response = await fetch('/api/credits/calculate-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          creatorFee: creatorFee,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCostBreakdown(data.breakdown);
      } else {
        // Fallback to manual calculation if API not ready
        const modelBaseCost = selectedModel === 'gpt-4o' ? 10000 : 
                             selectedModel === 'gpt-4' ? 30000 : 3000;
        
        const platformMarkup = creatorFee > 0 ? 0 : 
                              modelBaseCost < 10000 ? Math.floor(modelBaseCost * 0.2) :
                              modelBaseCost < 100000 ? Math.floor(modelBaseCost * 0.1) : 500;
        
        const totalCost = modelBaseCost + creatorFee + platformMarkup;
        
        setCostBreakdown({
          inferenceCost: modelBaseCost,
          creatorFee: creatorFee,
          platformMarkup: platformMarkup,
          totalCost: totalCost,
          dollarCost: (totalCost * 0.000001).toFixed(6)
        });
      }
    } catch (error) {
      console.error('Error calculating cost:', error);
      setMessage('Failed to calculate cost');
    }
  };

  const addCredits = async () => {
    try {
      setLoading(true);
      
      // Add credits to user
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          amount: testAmount,
          description: 'Test credit addition',
          type: 'CREDIT_PURCHASE'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Successfully added ${testAmount.toLocaleString()} credits to user`);
        fetchCredits();
        fetchTransactions();
      } else {
        setMessage('Failed to add credits');
      }
    } catch (error) {
      console.error('Error adding credits:', error);
      setMessage('Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  const runPrompt = async () => {
    try {
      setLoading(true);
      
      // Simulate running a prompt
      const response = await fetch('/api/credits/charge-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          promptId: TEST_PROMPT_ID,
          modelId: selectedModel,
          creatorId: TEST_CREATOR_ID,
          creatorFee: creatorFee
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Successfully ran prompt and processed credits`);
        fetchCredits();
        fetchTransactions();
      } else {
        setMessage(data.message || 'Failed to run prompt');
      }
    } catch (error) {
      console.error('Error running prompt:', error);
      setMessage('Failed to run prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Credit System Testing</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
          <button 
            className="ml-2 text-sm underline" 
            onClick={() => setMessage('')}
          >
            Clear
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Credit Balances</h2>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Test User (ID: {TEST_USER_ID})</div>
            <div className="text-2xl font-bold">{userCredits.toLocaleString()} credits</div>
            <div className="text-sm text-gray-500">≈ {formatCreditsToDollars(userCredits)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Test Creator (ID: {TEST_CREATOR_ID})</div>
            <div className="text-2xl font-bold">{creatorCredits.toLocaleString()} credits</div>
            <div className="text-sm text-gray-500">≈ {formatCreditsToDollars(creatorCredits)}</div>
          </div>
          
          <button
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={fetchCredits}
            disabled={loading}
          >
            Refresh Balances
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Add Test Credits</h2>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Amount to Add:</label>
            <div className="flex">
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
              <div className="ml-2 py-2 text-sm text-gray-500">
                ≈ ${(testAmount * 0.000001).toFixed(2)}
              </div>
            </div>
          </div>
          
          <button
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            onClick={addCredits}
            disabled={loading}
          >
            Add Credits to User
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-bold mb-4">Test Prompt Execution</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {TEST_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-1">Creator Fee (credits):</label>
            <input
              type="number"
              value={creatorFee}
              onChange={(e) => setCreatorFee(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>
        </div>
        
        {costBreakdown && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Cost Breakdown:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base inference cost:</span>
                <span>{costBreakdown.inferenceCost.toLocaleString()} credits</span>
              </div>
              
              {costBreakdown.platformMarkup > 0 && (
                <div className="flex justify-between">
                  <span>Platform markup:</span>
                  <span>{costBreakdown.platformMarkup.toLocaleString()} credits</span>
                </div>
              )}
              
              {costBreakdown.creatorFee > 0 && (
                <div className="flex justify-between">
                  <span>Creator fee:</span>
                  <span>{costBreakdown.creatorFee.toLocaleString()} credits</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium pt-1 border-t border-gray-200">
                <span>Total cost:</span>
                <span>{costBreakdown.totalCost.toLocaleString()} credits</span>
              </div>
              
              <div className="text-xs text-gray-500">
                <span>≈ {costBreakdown.dollarCost}</span>
              </div>
            </div>
            
            {costBreakdown.creatorFee > 0 && (
              <div className="mt-2 pt-1 border-t border-gray-200 text-sm text-gray-600">
                <div>Creator will receive: {Math.floor(costBreakdown.creatorFee * 0.8).toLocaleString()} credits (80%)</div>
                <div>Platform fee: {Math.floor(costBreakdown.creatorFee * 0.2).toLocaleString()} credits (20%)</div>
              </div>
            )}
          </div>
        )}
        
        <button
          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          onClick={runPrompt}
          disabled={loading || userCredits < (costBreakdown?.totalCost || 0)}
        >
          Test Run Prompt
        </button>
        
        {userCredits < (costBreakdown?.totalCost || 0) && (
          <div className="mt-2 text-sm text-red-600">
            Not enough credits to run this prompt. Add more credits to test.
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.type}</td>
                    <td className="px-4 py-2 text-sm">{tx.description}</td>
                    <td className={`px-4 py-2 text-sm text-right ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No transactions found
          </div>
        )}
        
        <button
          className="mt-4 w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
          onClick={fetchTransactions}
          disabled={loading}
        >
          Refresh Transactions
        </button>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>This is a test page for the credit system. It simulates:</p>
        <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
          <li>Checking user and creator balances</li>
          <li>Adding credits to a test user</li>
          <li>Running a prompt and processing the credit distribution</li>
          <li>Viewing recent credit transactions</li>
        </ul>
      </div>
    </div>
  );
}
