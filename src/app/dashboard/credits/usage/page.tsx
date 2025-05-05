"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreditPageHeader from '@/components/credits/CreditPageHeader';
import { getUserTotalCredits, getUserCreditHistory } from '@/lib/credits';

export default function CreditUsageAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Model usage stats
  const [modelUsage, setModelUsage] = useState<{
    modelId: string;
    displayName: string;
    totalCredits: number;
    percentage: number;
    color: string;
  }[]>([]);
  
  // Daily usage stats for chart
  const [dailyUsage, setDailyUsage] = useState<{
    date: string;
    credits: number;
  }[]>([]);
  
  // Load user data and transaction history
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/dashboard/credits/usage');
    }
    
    if (status === 'authenticated' && session?.user?.id) {
      const fetchData = async () => {
        try {
          // Get total credits
          const totalCredits = await getUserTotalCredits(session.user.id);
          setCredits(totalCredits);
          
          // Get transaction history - large limit to get all recent transactions
          const history = await getUserCreditHistory(
            session.user.id,
            100,
            0
          );
          
          setTransactions(history);
          
          // Calculate model usage stats
          calculateModelUsage(history);
          
          // Calculate daily usage for chart
          calculateDailyUsage(history);
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading credit data:', error);
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [status, router, session?.user?.id]);
  
  // Calculate model usage statistics
  const calculateModelUsage = (transactions: any[]) => {
    const models: Record<string, {
      modelId: string;
      displayName: string;
      totalCredits: number;
    }> = {};
    
    let totalUsage = 0;
    
    // Process transactions
    transactions.forEach(tx => {
      if (tx.creditsUsed > 0 && tx.userId === session?.user?.id) {
        const modelId = tx.modelId;
        const displayName = tx.model?.displayName || modelId || 'Unknown';
        
        if (!models[modelId]) {
          models[modelId] = {
            modelId,
            displayName,
            totalCredits: 0
          };
        }
        
        models[modelId].totalCredits += tx.creditsUsed;
        totalUsage += tx.creditsUsed;
      }
    });
    
    // Convert to array and calculate percentages
    const modelColors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
      'bg-pink-500', 'bg-orange-500', 'bg-teal-500'
    ];
    
    const modelArray = Object.values(models).map((model, index) => {
      return {
        ...model,
        percentage: totalUsage > 0 ? (model.totalCredits / totalUsage) * 100 : 0,
        color: modelColors[index % modelColors.length]
      };
    });
    
    // Sort by usage (highest first)
    modelArray.sort((a, b) => b.totalCredits - a.totalCredits);
    
    setModelUsage(modelArray);
  };
  
  // Calculate daily usage for chart
  const calculateDailyUsage = (transactions: any[]) => {
    const days: Record<string, number> = {};
    const now = new Date();
    
    // Initialize days based on selected timeframe
    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const daysToShow = timeframeMap[timeframe];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      days[dateString] = 0;
    }
    
    // Add transaction credits to days
    transactions.forEach(tx => {
      if (tx.creditsUsed > 0 && tx.userId === session?.user?.id) {
        const txDate = new Date(tx.createdAt);
        const dateString = txDate.toISOString().split('T')[0];
        
        // Only count if within our timeframe
        const daysAgo = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < daysToShow && days[dateString] !== undefined) {
          days[dateString] += tx.creditsUsed;
        }
      }
    });
    
    // Convert to array for chart
    const dailyArray = Object.entries(days).map(([date, credits]) => ({
      date,
      credits
    }));
    
    // Sort by date (oldest first)
    dailyArray.sort((a, b) => a.date.localeCompare(b.date));
    
    setDailyUsage(dailyArray);
  };
  
  // Change timeframe
  const handleTimeframeChange = (newTimeframe: '7d' | '30d' | '90d') => {
    setTimeframe(newTimeframe);
    calculateDailyUsage(transactions);
  };
  
  // Get total usage
  const getTotalUsage = () => {
    return modelUsage.reduce((sum, model) => sum + model.totalCredits, 0);
  };
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <CreditPageHeader 
        title="Credit Usage Analytics" 
        description="Analyze your credit usage patterns"
        credits={credits}
      />
      
      {loading ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="animate-pulse h-8 bg-gray-200 rounded mb-4 mx-auto max-w-md"></div>
          <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model usage breakdown */}
          <div className="bg-white shadow-sm rounded-lg p-6 lg:col-span-1">
            <h2 className="text-lg font-medium mb-4">Model Usage Breakdown</h2>
            
            {modelUsage.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No usage data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Total usage */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Total Credits Used</p>
                  <p className="text-2xl font-bold">{formatNumber(getTotalUsage())}</p>
                </div>
                
                {/* Model breakdown */}
                <div className="space-y-3">
                  {modelUsage.map((model) => (
                    <div key={model.modelId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{model.displayName}</span>
                        <span>{formatNumber(model.totalCredits)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${model.color} h-2.5 rounded-full`} 
                          style={{ width: `${model.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {model.percentage.toFixed(1)}% of total usage
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Usage over time */}
          <div className="bg-white shadow-sm rounded-lg p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Usage Over Time</h2>
              
              {/* Timeframe selector */}
              <div className="flex text-sm">
                <button
                  onClick={() => handleTimeframeChange('7d')}
                  className={`px-3 py-1 rounded-l-md ${
                    timeframe === '7d' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => handleTimeframeChange('30d')}
                  className={`px-3 py-1 ${
                    timeframe === '30d' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  30D
                </button>
                <button
                  onClick={() => handleTimeframeChange('90d')}
                  className={`px-3 py-1 rounded-r-md ${
                    timeframe === '90d' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  90D
                </button>
              </div>
            </div>
            
            {dailyUsage.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>No usage data available for the selected period</p>
              </div>
            ) : (
              <div className="h-64 w-full relative">
                {/* Simple bar chart visualization */}
                <div className="flex h-full items-end space-x-1">
                  {dailyUsage.map((day, index) => {
                    // Find max value for scaling
                    const maxCredits = Math.max(
                      ...dailyUsage.map(d => d.credits), 
                      1
                    );
                    
                    // Scale height (max 100%)
                    const heightPercentage = (day.credits / maxCredits) * 100;
                    
                    // Format date for tooltip
                    const formattedDate = new Date(day.date)
                      .toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                    
                    return (
                      <div 
                        key={day.date} 
                        className="flex-1 flex flex-col items-center group"
                        title={`${formattedDate}: ${formatNumber(day.credits)} credits`}
                      >
                        <div 
                          className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative"
                          style={{ height: `${Math.max(heightPercentage, 1)}%` }}
                        >
                          {/* Tooltip on hover */}
                          <div className="hidden group-hover:block absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {formattedDate}: {formatNumber(day.credits)}
                          </div>
                        </div>
                        
                        {/* Only show some date labels to avoid overcrowding */}
                        {(dailyUsage.length <= 14 || index % Math.ceil(dailyUsage.length / 14) === 0) && (
                          <span className="text-xs text-gray-500 mt-1 truncate" style={{ maxWidth: '100%' }}>
                            {formattedDate}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
