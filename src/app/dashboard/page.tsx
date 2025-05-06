import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserTotalCredits } from '@/lib/credits';
import Link from 'next/link';
import { 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  ListTodo,
  TrendingUp,
  FileText
} from 'lucide-react';
import { formatCredits } from '@/lib/creditHelpers';

// Sample data for recent activity
const recentActivity = [
  {
    id: 'act1',
    type: 'prompt',
    name: 'Customer Support Assistant',
    model: 'GPT-4o',
    credits: 15000,
    time: '2 hours ago'
  },
  {
    id: 'act2',
    type: 'flow',
    name: 'Data Processing Pipeline',
    model: 'Multiple Models',
    credits: 35000,
    time: '5 hours ago'
  },
  {
    id: 'act3',
    type: 'purchase',
    name: 'Credit Purchase',
    amount: 25000000,
    time: '2 days ago'
  },
  {
    id: 'act4',
    type: 'prompt',
    name: 'Product Description Generator',
    model: 'Sonar Pro',
    credits: 12500,
    time: '3 days ago'
  }
];

export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard');
  }
  
  // Get user's current credit balance
  const userId = session.user.id;
  let creditBalance = 0;
  
  try {
    creditBalance = await getUserTotalCredits(userId);
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    // Continue with 0 balance on error
  }
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session.user.name || 'User'}
        </p>
      </div>
      
      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
              <FileText className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">My Prompts</h3>
              <p className="text-sm text-gray-500">Create and manage your prompts</p>
            </div>
          </div>
          
          <Link
            href="/dashboard/prompts"
            className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            View Prompts <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
              <ListTodo className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Prompt Flows</h3>
              <p className="text-sm text-gray-500">Chain prompts together</p>
            </div>
          </div>
          
          <Link
            href="/flow"
            className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Flows <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Creator Tools</h3>
              <p className="text-sm text-gray-500">Create and publish prompts</p>
            </div>
          </div>
          
          <Link
            href="/dashboard/creator"
            className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Creator Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Credit summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Credit Summary</h2>
            <p className="text-gray-600 mt-1">Your available credits and recent usage</p>
          </div>
          
          <Link
            href="/dashboard/credits"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">Available Credits</h3>
            <div className="text-3xl font-bold text-gray-900">{formatCredits(creditBalance)}</div>
            <div className="mt-1 text-sm text-gray-500">= ${(creditBalance * 0.000001).toFixed(2)} USD</div>
            
            <Link
              href="/dashboard/credits"
              className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium"
            >
              Purchase Credits <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">Current Month Usage</h3>
            <div className="text-3xl font-bold text-gray-900">3.2M</div>
            <div className="mt-1 text-sm text-gray-500">= $3.20 USD</div>
            
            <Link
              href="/dashboard/credits/usage"
              className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium"
            >
              Usage Analytics <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-2">Creator Earnings</h3>
            <div className="text-3xl font-bold text-gray-900">410K</div>
            <div className="mt-1 text-sm text-gray-500">= $0.41 USD</div>
            
            <Link
              href="/dashboard/creator/earnings"
              className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium"
            >
              View Earnings <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-gray-600 mt-1">Your recent prompt runs and transactions</p>
          </div>
          
          <Link
            href="/dashboard/credits/history"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-2 md:mt-0"
          >
            View All Activity <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model / Details
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        activity.type === 'prompt' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'flow' ? 'bg-purple-100 text-purple-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {activity.type === 'prompt' ? <FileText className="h-4 w-4" /> :
                         activity.type === 'flow' ? <ListTodo className="h-4 w-4" /> :
                         <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {activity.model || (activity.type === 'purchase' ? 'Credit Bundle' : 'N/A')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.type === 'purchase' 
                        ? `+${formatCredits(activity.amount)}` 
                        : `-${formatCredits(activity.credits)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.type === 'purchase'
                        ? `+$${(activity.amount * 0.000001).toFixed(2)}`
                        : `-$${(activity.credits * 0.000001).toFixed(6)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
