'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits } from '@/lib/utils';

interface ModelUsage {
  modelId: string;
  displayName: string;
  credits: number;
  percentage: number;
  provider: string;
}

interface CreditUsageChartProps {
  userId: string;
  period?: 'week' | 'month' | 'year';
}

const CreditUsageChart: React.FC<CreditUsageChartProps> = ({ 
  userId, 
  period = 'month' 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<{
    modelUsage: ModelUsage[];
    totalUsage: number;
    periodLabel: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/credits/usage?userId=${userId}&period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch credit usage data');
        }
        
        const data = await response.json();
        setUsageData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching credit usage data:', err);
        setError('Could not load credit usage data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageData();
  }, [userId, period]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Credit Usage</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Credit Usage</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!usageData || usageData.modelUsage.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Credit Usage</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <p className="text-blue-700">
            No credit usage data available for this {period}. Run some prompts to see your usage breakdown.
          </p>
        </div>
      </div>
    );
  }
  
  // Define colors for different providers
  const providerColors: Record<string, string> = {
    openai: 'bg-green-500',
    sonar: 'bg-blue-500',
    anthropic: 'bg-purple-500',
    stability: 'bg-yellow-500',
    default: 'bg-gray-500'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Credit Usage</h2>
        
        <div className="flex items-center space-x-2">
          <select 
            value={period}
            onChange={(e) => window.location.href = `?period=${e.target.value}`}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">{usageData.periodLabel}</div>
        <div className="text-2xl font-bold">
          {formatCredits(usageData.totalUsage)} <span className="text-gray-500 text-base font-normal">credits used</span>
        </div>
      </div>
      
      {/* Bar chart */}
      <div className="space-y-3 mb-6">
        {usageData.modelUsage.map((model, index) => (
          <div key={model.modelId} className="space-y-1">
            <div className="flex justify-between text-sm">
              <div className="font-medium">{model.displayName}</div>
              <div className="text-gray-500">{formatCredits(model.credits)} ({model.percentage}%)</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className={`${providerColors[model.provider] || providerColors.default} h-2.5 rounded-full`}
                style={{ width: `${model.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(providerColors)
          .filter(([provider]) => 
            usageData.modelUsage.some(model => model.provider === provider)
          )
          .map(([provider, color]) => (
            <div key={provider} className="flex items-center">
              <div className={`${color} w-3 h-3 rounded-full mr-2`}></div>
              <div className="text-sm text-gray-600 capitalize">{provider}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default CreditUsageChart;