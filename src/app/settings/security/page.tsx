import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck, Key, Smartphone, Eye, EyeOff } from 'lucide-react';

export const metadata = {
  title: 'Security Settings - PromptFlow',
  description: 'Manage your account security and privacy settings',
};

export default async function SecurityPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings/security');
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Security Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account security and privacy settings
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Password section */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Password</h2>
              <p className="text-sm text-gray-500 mt-1">
                It's a good idea to use a strong password that you don't use elsewhere
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with a mix of letters, numbers, and symbols
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
        
        {/* Two-factor authentication */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Smartphone className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Authenticator App</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Use an authenticator app to generate verification codes
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Setup
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Verification</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Receive verification codes via text message
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Setup
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Backup Codes</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Generate backup codes to use when you don't have access to your other methods
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
        
        {/* API Keys */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Key className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">API Keys</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your API keys for programmatic access to PromptFlow
              </p>
            </div>
          </div>
          
          <div className="border rounded-md divide-y">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Production Key</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Created 2 months ago • Last used yesterday
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                  >
                    Revoke
                  </button>
                  <span className="text-gray-500 text-sm">••••••••••••sk7A</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Development Key</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Created 3 weeks ago • Last used today
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
                  >
                    Revoke
                  </button>
                  <span className="text-gray-500 text-sm">••••••••••••sk3B</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate New API Key
            </button>
          </div>
        </div>
        
        {/* Privacy settings */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <EyeOff className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Privacy Settings</h2>
              <p className="text-sm text-gray-500 mt-1">
                Control who can see your profile and content
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="publicProfile"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="publicProfile" className="font-medium text-gray-700">Public profile</label>
                <p className="text-gray-500">Allow others to view your profile and published prompts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="searchable"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="searchable" className="font-medium text-gray-700">Searchable</label>
                <p className="text-gray-500">Allow your profile to appear in search results</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="activityTracking"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="activityTracking" className="font-medium text-gray-700">Activity tracking</label>
                <p className="text-gray-500">Allow us to collect usage data to improve your experience</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="dataSharing"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="dataSharing" className="font-medium text-gray-700">Data sharing</label>
                <p className="text-gray-500">Share anonymous usage data to help improve AI models</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>
        
        {/* Session management */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Active Sessions</h2>
          <p className="text-sm text-gray-600 mb-4">
            These are the devices that are currently logged in to your account.
          </p>
          
          <div className="border rounded-md divide-y">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Current Session</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Windows 11 • Chrome • New York, USA
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Now
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Other Device</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    iPhone • Safari • New York, USA
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 mr-3">3 days ago</span>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              Logout of All Other Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
