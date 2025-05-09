import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import { getUserTotalCredits } from '@/lib/credits';
import Link from 'next/link';

export const metadata = {
  title: 'Profile Settings - PromptFlow',
  description: 'Manage your personal profile information',
};

export default async function ProfilePage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings/profile');
  }
  
  // Get user's credit balance (for display purposes)
  let creditBalance = 0;
  try {
    creditBalance = await getUserTotalCredits(session.user.id);
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    // Continue with 0 balance on error
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information and preferences
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Profile avatar section */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Profile Picture</h2>
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mr-6 overflow-hidden">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'Profile'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Upload New Image
              </button>
              <button className="px-4 py-2 ml-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Remove
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Accepted formats: JPG, PNG, GIF. Max size: 2MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Profile info form */}
        <form className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                defaultValue={session?.user?.name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed as it's used for login
              </p>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Tell others about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
        
        {/* Profile visibility settings */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Profile Visibility</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="showEmail"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="showEmail" className="font-medium text-gray-700">Show email on public profile</label>
                <p className="text-gray-500">Your email will be visible on your creator profile</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="showCredits"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="showCredits" className="font-medium text-gray-700">Show creator earnings on profile</label>
                <p className="text-gray-500">Show how many credits you've earned as a creator</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Visibility
            </button>
          </div>
        </div>
        
        {/* Profile actions section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="text-lg font-medium mb-4">Account Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/settings/account" 
              className="block text-blue-600 hover:text-blue-700"
            >
              Change account settings
            </Link>
            
            <Link 
              href="/settings/security" 
              className="block text-blue-600 hover:text-blue-700"
            >
              Update security preferences
            </Link>
            
            <Link 
              href="/dashboard/credits" 
              className="block text-blue-600 hover:text-blue-700"
            >
              Manage credits ({creditBalance.toLocaleString()})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
