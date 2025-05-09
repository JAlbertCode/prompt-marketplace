'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits, creditsToUSD } from '@/lib/utils';

interface PromptEarnings {
  promptId: string;
  promptTitle: string;
  totalRuns: number;
  totalEarnings: number;
  percentageOfTotal: number;
}

interface EarningsByPeriod {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
}

interface CreatorEarningsPanelProps {
  userId: string;
}

const CreatorEarningsPanel: React.FC<CreatorEarningsPanelProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<{
    byPrompt: PromptEarnings[];
    byPeriod: EarningsByPeriod;
    pendingPayout: number;
    totalUsers: number;
  } | null>(null);
  const [activePeriod, setActivePeriod] = useState<keyof EarningsByPeriod>('thisMonth');
  
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/creator/earnings?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch creator earnings');
        }
        
        const data = await response.json();
        setEarnings(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching creator earnings:', err);
        setError('Could not load creator earnings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarnings();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Creator Earnings</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Creator Earnings</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!earnings || earnings.byPrompt.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Creator Earnings</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <p className="text-blue-700">
            No earnings data available yet. Create and share prompts to start earning credits!
          </p>
        </div>
      </div>
    );
  }
  
  // Format a monetary value with an up/down indicator
  const formatChange = (value: number, showPositive = true) => {
    if (value === 0) return '0';
    
    const prefix = value > 0 ? (showPositive ? '+' : '') : '-';
    return `${prefix}${formatCredits(Math.abs(value))}`;
  };
  
  // Get period label
  const getPeriodLabel = (period: keyof EarningsByPeriod) => {
    switch (period) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'allTime': return 'All Time';
      default: return '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Creator Earnings</h2>
      
      {/* Earnings Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Earnings Summary</h3>
          
          <div className="flex rounded-md shadow-sm">
            {(Object.keys(earnings.byPeriod) as Array<keyof EarningsByPeriod>).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1 text-sm font-medium ${
                  activePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${
                  period === 'today' ? 'rounded-l-md' : ''
                } ${
                  period === 'allTime' ? 'rounded-r-md' : ''
                }`}
              >
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Earnings ({getPeriodLabel(activePeriod)})</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCredits(earnings.byPeriod[activePeriod])}
              </div>
              <div className="text-xs text-gray-500">
                Approximate value: {creditsToUSD(earnings.byPeriod[activePeriod])}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Pending Payout</div>
              <div className="text-2xl font-bold">
                {formatCredits(earnings.pendingPayout)}
              </div>
              <div className="text-xs text-gray-500">
                Available in your credit balance
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-xl font-medium">
                {earnings.totalUsers}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Prompts With Earnings</div>
              <div className="text-xl font-medium">
                {earnings.byPrompt.length}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Earning Prompts */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Top Earning Prompts</h3>
        
        <div className="overflow-hidden border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prompt
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Runs
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.byPrompt.map((prompt) => (
                <tr key={prompt.promptId} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <a href={`/prompts/${prompt.promptId}`} className="text-blue-600 hover:text-blue-800">
                      {prompt.promptTitle}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {prompt.totalRuns.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap font-medium text-green-600">
                    {formatCredits(prompt.totalEarnings)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {prompt.percentageOfTotal}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Note: Earnings are 80% of creator fees. The platform retains 20% of fees.
        </div>
      </div>
    </div>
  );
};

export default CreatorEarningsPanel;