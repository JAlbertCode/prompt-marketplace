"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowUpCircleIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { getUserCredits } from '@/utils/creditManager';

// Mock function to get creator earnings - would be replaced with actual API call
const getCreatorEarnings = async (userId: string) => {
  // This would be replaced with a real API call
  await new Promise(r => setTimeout(r, 500)); // Simulate API delay
  
  // Mock data - in a real app this would come from the API
  return {
    totalEarnings: 125000, // 125,000 credits
    promptRunEarnings: 80000,
    flowUnlockEarnings: 45000,
    earningsByPrompt: [
      { id: 'prompt1', title: 'Blog Post Generator', earnings: 35000 },
      { id: 'prompt2', title: 'Marketing Copy Creator', earnings: 25000 },
      { id: 'prompt3', title: 'Image Prompt Writer', earnings: 20000 },
    ],
    earningsByFlow: [
      { id: 'flow1', title: 'Content Creation Flow', earnings: 30000 },
      { id: 'flow2', title: 'SEO Optimization Flow', earnings: 15000 },
    ],
    // This would be daily earnings data for charts
    earningsByDay: Array.from({length: 30}, (_, i) => ({
      date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      earnings: Math.floor(Math.random() * 10000)
    }))
  };
};

export default function CreatorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [earningsData, setEarningsData] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year', 'all'

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/creator');
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated' || !session?.user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user's credit balance
        const userCredits = await getUserCredits(session.user.id);
        setCredits(userCredits);
        
        // Fetch creator earnings
        const earnings = await getCreatorEarnings(session.user.id);
        setEarningsData(earnings);
      } catch (err) {
        console.error('Error fetching creator data:', err);
        setError('Failed to load creator earnings');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [session, status, timeframe]);

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
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 px-3 py-1 text-sm">
            <CreditCardIcon className="h-4 w-4 text-gray-500 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">{credits.toLocaleString()} credits</span>
              <span className="text-gray-500 text-xs">${(credits / 1000000).toFixed(6)}</span>
            </div>
          </div>
          <Link 
            href="/create" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Create New Prompt
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Timeframe selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 text-sm rounded-lg ${
            timeframe === 'week'
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeframe('week')}
        >
          Last 7 days
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-lg ${
            timeframe === 'month'
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeframe('month')}
        >
          Last 30 days
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-lg ${
            timeframe === 'year'
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeframe('year')}
        >
          Last 12 months
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-lg ${
            timeframe === 'all'
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setTimeframe('all')}
        >
          All time
        </button>
      </div>

      {isLoading && !earningsData ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !earningsData ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No earnings data yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create and publish prompts or flows to start earning credits.
          </p>
          <div className="mt-6">
            <Link 
              href="/create" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Prompt
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {earningsData.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(earningsData.totalEarnings / 1000000).toFixed(6)}
                  </p>
                </div>
                <div className="rounded-full bg-green-50 p-3">
                  <ArrowUpCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">From Prompt Runs</p>
                  <p className="text-xl font-bold mt-1 text-blue-600">
                    {earningsData.promptRunEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((earningsData.promptRunEarnings / earningsData.totalEarnings) * 100)}% of total
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 p-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">From Flow Unlocks</p>
                  <p className="text-xl font-bold mt-1 text-purple-600">
                    {earningsData.flowUnlockEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((earningsData.flowUnlockEarnings / earningsData.totalEarnings) * 100)}% of total
                  </p>
                </div>
                <div className="rounded-full bg-purple-50 p-3">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Earnings by Prompt */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Top Earning Prompts</h2>
            {earningsData.earningsByPrompt.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No prompt earnings data available.</p>
            ) : (
              <div className="space-y-4">
                {earningsData.earningsByPrompt.map((prompt: any) => (
                  <div key={prompt.id} className="flex items-center">
                    <div className="w-1/2 pr-4">
                      <p className="text-sm font-medium truncate" title={prompt.title}>
                        {prompt.title}
                      </p>
                    </div>
                    <div className="w-1/2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.max(
                                (prompt.earnings / earningsData.promptRunEarnings) * 100,
                                5
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {prompt.earnings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Earnings by Flow */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Top Earning Flows</h2>
            {earningsData.earningsByFlow.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No flow earnings data available.</p>
            ) : (
              <div className="space-y-4">
                {earningsData.earningsByFlow.map((flow: any) => (
                  <div key={flow.id} className="flex items-center">
                    <div className="w-1/2 pr-4">
                      <p className="text-sm font-medium truncate" title={flow.title}>
                        {flow.title}
                      </p>
                    </div>
                    <div className="w-1/2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-purple-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.max(
                                (flow.earnings / earningsData.flowUnlockEarnings) * 100,
                                5
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">
                          {flow.earnings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Earnings Over Time Chart - Placeholder for chart component */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Earnings Over Time</h2>
            <div className="h-64 w-full">
              {/* This would be replaced with a chart component, such as using recharts */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">
                  Chart visualization would show earnings trend over {timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : timeframe === 'year' ? '12 months' : 'all time'}.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Total data points: {earningsData.earningsByDay.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Creator Tips */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Tips to Increase Your Earnings</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
                <p className="ml-2">Set optimal creator fees - too low means less earnings, too high might reduce usage.</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
                <p className="ml-2">Create premium flows combining multiple prompts to earn from one-time unlock fees.</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
                <p className="ml-2">Offer both free prompts to build a following and premium options for serious users.</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">•</div>
                <p className="ml-2">Focus on high-value use cases like content creation, data analysis, and business workflows.</p>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
