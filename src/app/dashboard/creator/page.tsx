import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CircleDollarSign, TrendingUp, BarChart3, Download, ArrowUpRight } from 'lucide-react';
import { formatCredits } from '@/lib/credits/supabase';

// Function to get creator's earnings from Supabase
async function getCreatorEarnings(userId: string) {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = createSupabaseServerClient();
  
  // Get total earnings
  const { data: totalData, error: totalError } = await supabase
    .from('payouts')
    .select('credits_earned, usd_equivalent, source_type, created_at')
    .eq('creator_id', userId);
  
  if (totalError) {
    console.error('Error fetching total earnings:', totalError);
    return {
      totalCreditsEarned: 0,
      totalUsdEarned: 0,
      promptRunRevenue: 0,
      promptUnlockRevenue: 0,
      flowRunRevenue: 0,
      flowUnlockRevenue: 0,
      recentPayouts: []
    };
  }
  
  // Calculate totals
  const totalCreditsEarned = totalData?.reduce((sum, payout) => sum + payout.credits_earned, 0) || 0;
  const totalUsdEarned = totalData?.reduce((sum, payout) => sum + payout.usd_equivalent, 0) || 0;
  
  // Get earnings by source type
  const promptRunRevenue = totalData
    ?.filter(payout => payout.source_type === 'prompt')
    .reduce((sum, payout) => sum + payout.credits_earned, 0) || 0;
  
  const flowRunRevenue = totalData
    ?.filter(payout => payout.source_type === 'flow')
    .reduce((sum, payout) => sum + payout.credits_earned, 0) || 0;
  
  // For simplicity, we're assuming prompt/flow unlock revenue would be in the same table
  // In a real application, this might come from a different table
  const promptUnlockRevenue = 0;
  const flowUnlockRevenue = 0;
  
  // Get recent payouts
  const { data: recentData, error: recentError } = await supabase
    .from('payouts')
    .select(`
      id,
      credits_earned,
      usd_equivalent,
      source_type,
      source_id,
      created_at,
      prompts (name),
      flows (name)
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (recentError) {
    console.error('Error fetching recent payouts:', recentError);
    return {
      totalCreditsEarned,
      totalUsdEarned,
      promptRunRevenue,
      promptUnlockRevenue,
      flowRunRevenue,
      flowUnlockRevenue,
      recentPayouts: []
    };
  }
  
  return {
    totalCreditsEarned,
    totalUsdEarned,
    promptRunRevenue,
    promptUnlockRevenue,
    flowRunRevenue,
    flowUnlockRevenue,
    recentPayouts: recentData || []
  };
}

export default async function CreatorRevenuePage() {
  // Authentication check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login?returnUrl=/dashboard/creator');
  }
  
  // Get creator's earnings
  const {
    totalCreditsEarned,
    totalUsdEarned,
    promptRunRevenue,
    promptUnlockRevenue,
    flowRunRevenue,
    flowUnlockRevenue,
    recentPayouts
  } = await getCreatorEarnings(user.id);
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your prompts and flows revenue
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCredits(totalCreditsEarned)}</h3>
              <p className="text-sm text-gray-500">${totalUsdEarned.toFixed(2)} USD</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Prompt Run Revenue</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCredits(promptRunRevenue)}</h3>
              <p className="text-sm text-gray-500">${(promptRunRevenue * 0.000001).toFixed(2)} USD</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Flow Run Revenue</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCredits(flowRunRevenue)}</h3>
              <p className="text-sm text-gray-500">${(flowRunRevenue * 0.000001).toFixed(2)} USD</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">30-Day Trend</p>
              <h3 className="text-xl font-bold text-gray-900">+{formatCredits(
                recentPayouts
                  .filter(payout => {
                    const payoutDate = new Date(payout.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return payoutDate >= thirtyDaysAgo;
                  })
                  .reduce((sum, payout) => sum + payout.credits_earned, 0)
              )}</h3>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Revenue Breakdown</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">Prompt Revenue</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Run Revenue</p>
                    <p className="text-xs text-gray-500">Prompts used by customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCredits(promptRunRevenue)}</p>
                    <p className="text-xs text-gray-500">${(promptRunRevenue * 0.000001).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Unlock Revenue</p>
                    <p className="text-xs text-gray-500">Prompts purchased by customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCredits(promptUnlockRevenue)}</p>
                    <p className="text-xs text-gray-500">${(promptUnlockRevenue * 0.000001).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-medium">
                  <p className="text-sm text-gray-900">Total Prompt Revenue</p>
                  <p className="text-sm text-gray-900">{formatCredits(promptRunRevenue + promptUnlockRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">Flow Revenue</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Run Revenue</p>
                    <p className="text-xs text-gray-500">Flows used by customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCredits(flowRunRevenue)}</p>
                    <p className="text-xs text-gray-500">${(flowRunRevenue * 0.000001).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Unlock Revenue</p>
                    <p className="text-xs text-gray-500">Flows purchased by customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCredits(flowUnlockRevenue)}</p>
                    <p className="text-xs text-gray-500">${(flowUnlockRevenue * 0.000001).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-medium">
                  <p className="text-sm text-gray-900">Total Flow Revenue</p>
                  <p className="text-sm text-gray-900">{formatCredits(flowRunRevenue + flowUnlockRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Payouts */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Payouts</h2>
          
          <Link 
            href="/dashboard/creator/payouts"
            className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-800"
          >
            View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USD Value
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayouts.length > 0 ? (
                recentPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payout.source_type === 'prompt' 
                          ? payout.prompts?.name || 'Unknown Prompt'
                          : payout.flows?.name || 'Unknown Flow'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payout.source_type === 'prompt'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {payout.source_type === 'prompt' ? 'Prompt' : 'Flow'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCredits(payout.credits_earned)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ${payout.usd_equivalent.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(payout.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No recent payouts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
