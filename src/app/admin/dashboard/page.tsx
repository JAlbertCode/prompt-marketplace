'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch waitlist count
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('/api/waitlist');
        
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.entries?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWaitlistCount();
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Waitlist Stats */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Waitlist</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total Subscribers</p>
              <p className="text-3xl font-bold">{waitlistCount}</p>
            </div>
            <Link 
              href="/admin/waitlist"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link 
              href="/admin/waitlist/email"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg"
            >
              Send Email to Waitlist
            </Link>
            <Link 
              href="/admin/waitlist"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-3 rounded-lg"
            >
              Manage Waitlist
            </Link>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Brevo Integration</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">User Authentication</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Waitlist Signup</p>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}