"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, CreditCard } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';
import { getUserTotalCredits } from '@/lib/credits';

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Notification preferences (dummy state for demonstration)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/settings/account');
    }
    
    if (status === 'authenticated') {
      setLoading(false);
      
      // Fetch user credits
      const fetchCredits = async () => {
        if (session?.user?.id) {
          try {
            const totalCredits = await getUserTotalCredits(session.user.id);
            setCredits(totalCredits);
          } catch (error) {
            console.error('Error fetching credits:', error);
          }
        }
      };
      
      fetchCredits();
    }
  }, [status, router, session?.user?.id]);
  
  if (loading) {
    return <div className="p-6 text-center">Loading account settings...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        
        {/* Credits button included here as well for consistent access */}
        <CreditsButton credits={credits} variant="minimal" />
      </div>
      
      <div className="space-y-6">
        {/* Notification Preferences */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Bell className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive updates about your prompts, credits, and account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">App Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications within the app
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appNotifications}
                  onChange={() => setAppNotifications(!appNotifications)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Credit Management Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Credit Management</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">Current Credit Balance:</p>
            <p className="text-2xl font-bold text-blue-600">
              {credits !== undefined ? credits.toLocaleString() : '...'}
            </p>
            <p className="text-xs text-gray-500">
              1 credit = $0.000001 USD
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => router.push('/dashboard/credits')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Purchase Credits
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              View Transaction History
            </button>
          </div>
        </div>
        
        {/* Account Management */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Settings className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Account Management</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Account Type</p>
              <p className="text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Standard Account
                </span>
              </p>
            </div>
            
            <div>
              <p className="font-medium">Account ID</p>
              <p className="text-sm text-gray-500">
                {session?.user?.id || 'Not available'}
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900">Danger Zone</p>
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 mb-2">
                  Deactivating your account will temporarily suspend your access to PromptFlow.
                </p>
                <button className="px-3 py-1.5 bg-white border border-red-300 text-red-600 text-sm rounded hover:bg-red-50">
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
