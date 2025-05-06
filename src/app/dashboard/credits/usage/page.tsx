import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreditsOverviewChart from '@/components/credits/CreditsOverviewChart';
import ModelCostsTable from '@/components/credits/ModelCostsTable';
import Link from 'next/link';
import { BarChart3, Tag, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Usage Analytics - PromptFlow',
  description: 'Analyze credit usage patterns across models and time',
};

export default async function UsageAnalyticsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits/usage');
  }
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track and analyze your credit usage patterns
        </p>
      </div>
      
      {/* Usage Overview */}
      <div className="mb-8">
        <CreditsOverviewChart timeframe="30d" />
      </div>
      
      {/* Usage stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Recent Trend</h3>
              <p className="text-sm text-gray-500">Last 7 days vs. previous</p>
            </div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">+12.4%</span>
            <span className="ml-2 text-sm text-gray-500">Usage increase</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Mostly driven by increased usage of GPT-4o models</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Top Model</h3>
              <p className="text-sm text-gray-500">Most used in past 30 days</p>
            </div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">GPT-4o</span>
            <span className="ml-2 text-sm text-gray-500">45% of total usage</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>8.2M credits used with this model</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
              <Tag className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Cost Efficiency</h3>
              <p className="text-sm text-gray-500">Credits per request</p>
            </div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">12,423</span>
            <span className="ml-2 text-sm text-gray-500">Avg. per request</span>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Consider using smaller models for simple tasks</p>
            
            <Link 
              href="/dashboard/credits/pricing" 
              className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm mt-2"
            >
              View model pricing
            </Link>
          </div>
        </div>
      </div>
      
      {/* Model usage breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Model Usage Breakdown</h2>
        
        <div className="space-y-6">
          {/* OpenAI Models Usage */}
          <div>
            <h3 className="font-medium text-lg mb-3">OpenAI Models</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">GPT-4o</span>
                  <span>8.2M credits (45%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">GPT-4o Mini</span>
                  <span>4.5M credits (25%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">GPT-4o Audio</span>
                  <span>1.8M credits (10%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sonar Models Usage */}
          <div>
            <h3 className="font-medium text-lg mb-3">Sonar Models</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Sonar Pro Medium</span>
                  <span>2.7M credits (15%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Sonar Pro High</span>
                  <span>900K credits (5%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link 
            href="/dashboard/credits/pricing" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Complete Model Pricing
          </Link>
        </div>
      </div>
      
      {/* Usage recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">Usage Recommendations</h2>
        
        <div className="space-y-6">
          <div className="flex">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
              <span className="font-medium">1</span>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-lg">Switch to smaller models for simple tasks</h3>
              <p className="text-gray-600 mt-1">
                Use GPT-4o Mini or Sonar Pro Medium for routine tasks that don't require the full capabilities
                of the larger models. This could reduce your costs by up to 85%.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
              <span className="font-medium">2</span>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-lg">Optimize prompt length</h3>
              <p className="text-gray-600 mt-1">
                Your average prompt length puts 65% of requests in the "Medium" pricing tier. Shortening
                prompts could move many requests to the "Short" tier, saving approximately 40% on those requests.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
              <span className="font-medium">3</span>
            </div>
            <div className="ml-4">
              <h3 className="font-medium text-lg">Use Prompt Flows for complex tasks</h3>
              <p className="text-gray-600 mt-1">
                Creating modular Prompt Flows with smaller, targeted prompts is more cost-effective than
                using single large prompts. This can improve both cost efficiency and quality of results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
