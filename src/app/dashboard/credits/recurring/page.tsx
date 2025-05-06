import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Recurring Credits - PromptFlow',
  description: 'Manage automatic credit top-ups and subscriptions',
};

export default async function RecurringCreditsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/dashboard/credits/recurring');
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Recurring Credits</h1>
        <p className="text-gray-600 mt-1">
          Set up automatic credit top-ups and subscription plans
        </p>
      </div>
      
      {/* Beta notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Beta Feature
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The recurring credits feature is currently in beta. We appreciate your feedback as we continue to improve this feature.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* No active subscriptions state */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Clock className="h-6 w-6 text-gray-500" />
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">No Active Subscriptions</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          You don't have any recurring credit plans set up yet. Create one to ensure you never run out of credits.
        </p>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Set Up Recurring Credits
        </button>
      </div>
      
      {/* Available subscription plans */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Available Subscription Plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">Starter</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Monthly
              </span>
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold">$10</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                10M credits per month
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Automatic renewal
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
            <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
          
          <div className="border rounded-lg p-5 border-blue-500 shadow-md bg-blue-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">Professional</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Monthly
              </span>
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold">$25</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                27.5M credits per month (inc. 2.5M bonus)
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Automatic renewal
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
          
          <div className="border rounded-lg p-5 hover:border-blue-500 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold">Business</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Monthly
              </span>
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold">$50</span>
              <span className="text-gray-500 ml-1">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                57.5M credits per month (inc. 7.5M bonus)
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Automatic renewal
              </li>
              <li className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                Cancel anytime
              </li>
            </ul>
            <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      {/* Auto top-up feature */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium">Automatic Top-Up</h2>
            <p className="text-sm text-gray-500 mt-1">
              Set a threshold to automatically purchase more credits when your balance gets low
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="enableAutoTopup"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="enableAutoTopup" className="font-medium text-gray-700">Enable automatic top-up</label>
                  <p className="text-gray-500">Automatically purchase credits when your balance falls below the threshold</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                <div>
                  <label htmlFor="topupThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                    Threshold (credits)
                  </label>
                  <select
                    id="topupThreshold"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option>1,000,000 credits</option>
                    <option>2,000,000 credits</option>
                    <option>5,000,000 credits</option>
                    <option>10,000,000 credits</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="topupAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Purchase
                  </label>
                  <select
                    id="topupAmount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option>10M credits ($10.00)</option>
                    <option>25M credits + 2.5M bonus ($25.00)</option>
                    <option>50M credits + 7.5M bonus ($50.00)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">What is the difference between subscriptions and auto top-ups?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Subscriptions provide a fixed amount of credits each month with automatic billing. 
              Auto top-ups only purchase credits when your balance falls below a certain threshold.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Can I cancel my subscription at any time?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing period.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">Do unused credits expire?</h3>
            <p className="text-sm text-gray-500 mt-1">
              No, your credits never expire. They will remain in your account until you use them.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">How are subscription credits delivered?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Subscription credits are added to your account on your billing date each month.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            href="/help/credits" 
            className="inline-flex items-center text-blue-600 hover:text-blue-500"
          >
            View all credit questions <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
