'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Book, Zap, ArrowDown, ArrowUp } from 'lucide-react';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';
import { toast } from 'react-hot-toast';

// Sample data for earnings chart
const earningsData = [
  { month: 'Jan', credits: 5000 },
  { month: 'Feb', credits: 8000 },
  { month: 'Mar', credits: 12000 },
  { month: 'Apr', credits: 15000 },
  { month: 'May', credits: 10000 },
];

// Sample data for top prompts
const topPrompts = [
  { id: '1', title: 'Product Description Writer', credits: 15000, runs: 76 },
  { id: '2', title: 'Social Media Post Generator', credits: 8000, runs: 128 },
  { id: '3', title: 'Customer Support Email Generator', credits: 6500, runs: 156 },
];

// Sample data for top flows
const topFlows = [
  { id: '1', title: 'Content Creation Pipeline', credits: 25000, runs: 42 },
  { id: '3', title: 'Code Review Pipeline', credits: 12000, runs: 37 },
];

export default function CreatorEarningsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(50000);
  const [monthlyEarnings, setMonthlyEarnings] = useState(15000);
  const [comparedToPrevMonth, setComparedToPrevMonth] = useState(25); // percentage

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/creator/earnings');
      return;
    }

    // Simulate API fetch
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [status, router]);

  // Format credits to USD
  const formatCreditsToUsd = (credits: number) => {
    return `$${(credits * 0.000001).toFixed(2)}`;
  };

  // Format large numbers with commas
  const formatCredits = (num: number) => {
    return num.toLocaleString();
  };

  // Define creator navigation tabs
  const creatorTabs = [
    { href: '/dashboard/creator', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/content', label: 'My Content', icon: Book },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Creator Earnings"
        description="Track your earnings from prompts and flows"
        tabs={creatorTabs}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Earnings</h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCredits(totalEarnings)} credits
          </p>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(totalEarnings)} USD
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">This Month</h2>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-blue-600">
              {formatCredits(monthlyEarnings)} credits
            </p>
            <div className={`ml-2 flex items-center ${comparedToPrevMonth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {comparedToPrevMonth >= 0 ? 
                <ArrowUp size={16} /> : 
                <ArrowDown size={16} />
              }
              <span className="text-sm font-medium">{Math.abs(comparedToPrevMonth)}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            = {formatCreditsToUsd(monthlyEarnings)} USD
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Usage Stats</h2>
          <p className="text-xl font-medium">
            {topPrompts.reduce((acc, prompt) => acc + prompt.runs, 0)} prompt uses
          </p>
          <p className="text-xl font-medium">
            {topFlows.reduce((acc, flow) => acc + flow.runs, 0)} flow uses
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Across {topPrompts.length} prompts and {topFlows.length} flows
          </p>
        </ContentCard>
      </div>

      <ContentCard title="Monthly Earnings" className="mb-8">
        <div className="py-4">
          <div className="flex items-end justify-between h-64 gap-4">
            {earningsData.map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 w-full rounded-t-md transition-all duration-500 ease-in-out"
                  style={{ 
                    height: `${(data.credits / Math.max(...earningsData.map(d => d.credits))) * 200}px` 
                  }}
                ></div>
                <div className="mt-2 text-sm font-medium">{data.month}</div>
                <div className="text-xs text-gray-500">{formatCredits(data.credits)}</div>
              </div>
            ))}
          </div>
        </div>
      </ContentCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ContentCard title="Top Earning Prompts">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prompt
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPrompts.map((prompt) => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prompt.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {prompt.runs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="font-medium text-gray-900">{formatCredits(prompt.credits)}</span>
                      <p className="text-xs text-gray-500">{formatCreditsToUsd(prompt.credits)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>

        <ContentCard title="Top Earning Flows">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flow
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topFlows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {flow.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {flow.runs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="font-medium text-gray-900">{formatCredits(flow.credits)}</span>
                      <p className="text-xs text-gray-500">{formatCreditsToUsd(flow.credits)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentCard>
      </div>
    </div>
  );
}
