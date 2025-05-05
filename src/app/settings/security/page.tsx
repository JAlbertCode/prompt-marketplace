"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Key, CreditCard } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';
import { getUserTotalCredits } from '@/lib/credits';

export default function SecuritySettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/settings/security');
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
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status messages
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // TODO: Implement actual password change API call
    // For now, just simulate success
    setSuccess('Password changed successfully');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  if (loading) {
    return <div className="p-6 text-center">Loading security settings...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Security Settings</h1>
        
        {/* Credits button included here as well for consistent access */}
        <CreditsButton credits={credits} variant="minimal" />
      </div>
      
      <div className="space-y-6">
        {/* Password Change */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Lock className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Change Password</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters and include a mix of letters, numbers, and symbols.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
        
        {/* Two-Factor Authentication */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Key className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
          </div>
          
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Enable Two-Factor Authentication
          </button>
        </div>
        
        {/* API Keys (For creator/developer accounts) */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-4">
            <Shield className="mr-2 h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">API Access</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              Manage API keys for automated workflows and integrations.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Generate New API Key
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              View Existing Keys
            </button>
          </div>
        </div>
        
        {/* Credits Security Section - With Direct Access */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium">Credit Security</h2>
            </div>
            <CreditsButton credits={credits} variant="minimal" />
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              Set up spending limits and notifications for your credits.
            </p>
            <button 
              onClick={() => router.push('/dashboard/credits')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Manage Credit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
