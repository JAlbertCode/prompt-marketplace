"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import CreditsButton from '@/components/CreditsButton';
import { getUserTotalCredits } from '@/lib/credits';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?returnUrl=/settings/profile');
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
    return <div className="p-6 text-center">Loading profile...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        
        {/* Credits button included here as well for consistent access */}
        <CreditsButton credits={credits} variant="minimal" />
      </div>
      
      <div className="space-y-6">
        {/* Profile avatar section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Profile Picture</h2>
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-6 overflow-hidden">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'Profile'} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-200">
                Change Picture
              </button>
              <p className="text-sm text-gray-500 mt-2">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>
        </div>
        
        {/* Profile info section */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                className="w-full px-3 py-2 border rounded-md"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email address is used for login and cannot be changed.
              </p>
            </div>
            <div className="pt-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        {/* Credits section with direct link */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Your Credits</h2>
            <CreditsButton credits={credits} variant="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
