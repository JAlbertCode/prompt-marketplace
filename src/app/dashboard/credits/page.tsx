import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserTotalCredits } from '@/lib/credits';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Purchase Credits - PromptFlow',
  description: 'Purchase credits to run prompts and flows on PromptFlow',
};

// Function to get monthly burn rate
async function getMonthlyBurn(userId: string): Promise<number> {
  // Calculate 30-day credit burn from transaction history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    
    // Sum all credits used in the last 30 days
    return transactions.reduce((total, transaction) => {
      return total + transaction.creditsUsed;
    }, 0);
  } catch (error) {
    console.error("Error calculating monthly burn:", error);
    return 0; // Default to 0 if there's an error
  }
}

// Function to get credit tier based on monthly burn
function getCreditTier(monthlyBurn: number): string {
  if (monthlyBurn >= 1400000) return "Enterprise";
  if (monthlyBurn >= 600000) return "High Volume";
  if (monthlyBurn >= 300000) return "Medium Volume";
  if (monthlyBurn >= 100000) return "Low Volume";
  return "Standard";
}

// Credit Package Card Component
function CreditPackage({ 
  amount, 
  bonus, 
  price, 
  isRecommended = false 
}: { 
  amount: string; 
  bonus: string; 
  price: string;
  isRecommended?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-5 transition-all ${
      isRecommended 
        ? 'border-blue-500 shadow-md bg-blue-50' 
        : 'hover:border-gray-400 hover:shadow-sm'
    }`}>
      {isRecommended && (
        <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
          Recommended
        </div>
      )}
      
      <h3 className="text-xl font-bold">{amount} Credits</h3>
      
      {bonus !== "0" && (
        <p className="text-green-600 font-medium mt-1">+ {bonus} Bonus</p>
      )}
      
      <div className="mt-4 mb-2 flex items-baseline">
        <span className="text-2xl font-bold">{price}</span>
        <span className="text-gray-500 text-sm ml-1">USD</span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">
        = ${(parseInt(amount.replace(/[^0-9]/g, '')) * 0.000001).toFixed(2)} value
      </p>
      
      <button className={`w-full py-2 rounded-md font-medium ${
        isRecommended 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-white hover:bg-gray-50 text-blue-600 border border-blue-600'
      }`}>
        Purchase
      </button>
    </div>
  );
}

export default async function CreditsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits');
  }
  
  // Get user's current credit balance and monthly burn
  const userId = session.user.id;
  const creditBalance = await getUserTotalCredits(userId);
  const monthlyBurn = await getMonthlyBurn(userId);
  const creditTier = getCreditTier(monthlyBurn);
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Credits</h1>
        <p className="text-gray-600 mt-1">
          Purchase and manage credits to run prompts and flows
        </p>
      </div>
      
      {/* Credit overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Available Credits</div>
          <div className="text-3xl font-bold mb-1">{creditBalance.toLocaleString()}</div>
          <div className="text-sm text-gray-600">
            = ${(creditBalance * 0.000001).toFixed(6)} USD
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">30-Day Usage</div>
          <div className="text-3xl font-bold mb-1">{monthlyBurn.toLocaleString()}</div>
          <div className="text-sm text-gray-600">
            = ${(monthlyBurn * 0.000001).toFixed(2)} USD
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Account Tier</div>
          <div className="text-3xl font-bold mb-1">{creditTier}</div>
          <div className="text-sm text-gray-600">
            Based on your monthly usage
          </div>
        </div>
      </div>
      
      {/* Usage analytics teaser */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold mb-1">Usage Analytics</h2>
            <p className="text-gray-600">
              Track your credit usage and model performance
            </p>
          </div>
          
          <Link 
            href="/dashboard/credits/usage" 
            className="mt-3 md:mt-0 flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View detailed analytics <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Credit packages */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Credit Packages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <CreditPackage amount="10M" bonus="0" price="$10" />
          <CreditPackage amount="25M" bonus="2.5M" price="$25" isRecommended={true} />
          <CreditPackage amount="50M" bonus="7.5M" price="$50" />
          <CreditPackage amount="100M" bonus="20M" price="$100" />
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-5">
          <h3 className="text-lg font-semibold mb-3">Enterprise Plans</h3>
          <p className="text-gray-600 mb-4">
            For high-volume users with 1.4M+ monthly credit burn. Get higher bonuses and dedicated support.
          </p>
          
          <Link 
            href="/enterprise" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact sales for enterprise plans <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Usage bonuses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-3">Automation Bonuses</h2>
        <p className="text-gray-600 mb-6">
          Get bonus credits when you integrate PromptFlow with your automation tools via API or n8n.
        </p>
        
        <div className="relative overflow-x-auto rounded-md">
          <table className="w-full text-sm text-left">
            <thead className="text-xs bg-gray-50 text-gray-700 uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">Monthly Usage</th>
                <th scope="col" className="px-6 py-3">Monthly Bonus</th>
                <th scope="col" className="px-6 py-3">Requirements</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="px-6 py-4 font-medium">100K - 299K</td>
                <td className="px-6 py-4 text-green-600">10,000 credits</td>
                <td className="px-6 py-4">API or n8n integration</td>
              </tr>
              <tr className="bg-gray-50 border-b">
                <td className="px-6 py-4 font-medium">300K - 599K</td>
                <td className="px-6 py-4 text-green-600">40,000 credits</td>
                <td className="px-6 py-4">API or n8n integration</td>
              </tr>
              <tr className="bg-white border-b">
                <td className="px-6 py-4 font-medium">600K - 999K</td>
                <td className="px-6 py-4 text-green-600">100,000 credits</td>
                <td className="px-6 py-4">API or n8n integration</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium">1.4M+</td>
                <td className="px-6 py-4 text-green-600">400,000 credits</td>
                <td className="px-6 py-4">Enterprise tier required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
