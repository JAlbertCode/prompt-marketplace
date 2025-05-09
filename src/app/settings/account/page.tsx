import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Account Settings - PromptFlow',
  description: 'Manage your account settings and preferences',
};

export default async function AccountPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings/account');
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage account preferences and connected services
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Account preferences */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="utc">UTC (Coordinated Universal Time)</option>
                <option value="est">Eastern Standard Time (UTC-5)</option>
                <option value="cst">Central Standard Time (UTC-6)</option>
                <option value="pst">Pacific Standard Time (UTC-8)</option>
                <option value="gmt">Greenwich Mean Time (UTC+0)</option>
                <option value="cet">Central European Time (UTC+1)</option>
              </select>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="advancedEditor"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="advancedEditor" className="font-medium text-gray-700">Use advanced prompt editor</label>
                <p className="text-gray-500">Enable advanced editing features like syntax highlighting and code blocks</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
        
        {/* Connected accounts */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Connected Accounts</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">GitHub</p>
                  <p className="text-xs text-gray-500">Connect to share and synchronize prompts</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Facebook</p>
                  <p className="text-xs text-gray-500">Connect for easier login and sharing</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Twitter</p>
                  <p className="text-xs text-gray-500">Share your prompts on social media</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50">
                Connect
              </button>
            </div>
          </div>
        </div>
        
        {/* Billing info */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Billing Information</h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Your billing information is used for credit purchases and subscription management.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="country"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="gb">United Kingdom</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID (optional)
              </label>
              <input
                id="taxId"
                type="text"
                placeholder="For business purchases"
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/dashboard/credits/billing" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
            >
              Manage Payment Methods
            </Link>
          </div>
        </div>
        
        {/* Danger zone */}
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium text-red-700 mb-4">Danger Zone</h2>
              
              <p className="text-sm text-red-600 mb-4">
                These actions are permanent and cannot be undone. Please proceed with caution.
              </p>
              
              <div className="space-y-4">
                <div>
                  <button className="px-4 py-2 border border-red-300 bg-white text-red-600 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors">
                    Download All Data
                  </button>
                  <p className="text-xs text-red-600 mt-1">
                    Download a copy of all your data, including prompts, flows, and usage history.
                  </p>
                </div>
                
                <div>
                  <button className="px-4 py-2 border border-red-300 bg-white text-red-600 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors">
                    Delete All Prompts
                  </button>
                  <p className="text-xs text-red-600 mt-1">
                    Delete all your prompts and flows. Your account will remain active.
                  </p>
                </div>
                
                <div>
                  <button className="px-4 py-2 border border-red-500 bg-red-600 text-white rounded-md hover:bg-red-700 hover:border-red-600 transition-colors">
                    Delete Account
                  </button>
                  <p className="text-xs text-red-600 mt-1">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
