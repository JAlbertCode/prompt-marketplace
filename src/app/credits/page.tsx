'use client';

import React, { useState, useEffect } from 'react';
import CreditBalance from '@/components/credits/CreditBalance';
import CreditPurchase from '@/components/credits/CreditPurchase';
import TransactionHistory from '@/components/credits/TransactionHistory';
import { getUserCredits } from '@/utils/creditManager';

// In a real app, this would come from your auth system
const CURRENT_USER_ID = 'user_123';

export default function CreditsPage() {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'balance' | 'buy' | 'history'>('balance');

  useEffect(() => {
    async function fetchCredits() {
      try {
        setLoading(true);
        const userCredits = await getUserCredits(CURRENT_USER_ID);
        setCredits(userCredits);
      } catch (err) {
        console.error('Failed to fetch user credits', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
  }, []);

  const handlePurchase = async (packageId: string, amount: number) => {
    try {
      // In a real app, this would call your payment API
      console.log(`Processing purchase of package ${packageId} for $${amount}`);
      
      // Simulate successful purchase
      setTimeout(async () => {
        const newBalance = await getUserCredits(CURRENT_USER_ID);
        setCredits(newBalance);
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Purchase failed', err);
      return false;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Credit Management</h1>
      
      {/* Top Credit Balance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg text-gray-600 mb-1">Your Credit Balance</h2>
            <CreditBalance 
              credits={credits} 
              loading={loading} 
              showBuyButton={false} 
            />
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('buy')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            >
              Buy More Credits
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'balance'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('balance')}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'buy'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('buy')}
        >
          Buy Credits
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Transaction History
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeTab === 'balance' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Credit Balance Summary</h2>
            <p className="mb-4">
              Your current balance is <strong>{credits.toLocaleString()} credits</strong>, 
              which is equivalent to <strong>${(credits * 0.000001).toFixed(2)}</strong>.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <h3 className="font-medium mb-2">Understanding PromptFlow Credits</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>1 credit = $0.000001 (1 million credits = $1.00)</li>
                <li>Credits are used for running prompts and flows</li>
                <li>Creator fees: 80% goes to creators, 20% to platform</li>
                <li>When no creator fee is set, a platform markup is applied</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Credit Usage Tips</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Smaller models like GPT-4o Mini cost fewer credits</li>
                <li>Credits never expire</li>
                <li>Save on Flow runs by using them frequently (most efficient for repeat tasks)</li>
                <li>Publish your prompts to earn creator fees</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'buy' && (
          <CreditPurchase onPurchase={handlePurchase} currentCredits={credits} />
        )}
        
        {activeTab === 'history' && (
          <TransactionHistory userId={CURRENT_USER_ID} />
        )}
      </div>
    </div>
  );
}
