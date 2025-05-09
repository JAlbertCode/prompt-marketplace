'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type WaitlistEntry = {
  email: string;
  joinedAt: string;
  source?: string;
  ipAddress?: string;
};

export default function AdminWaitlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState({ status: '', message: '' });

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Fetch waitlist entries when component mounts
    const fetchWaitlist = async () => {
      try {
        const response = await fetch('/api/waitlist');
        
        if (response.ok) {
          const data = await response.json();
          setWaitlistEntries(data.entries || []);
        } else {
          console.error('Failed to fetch waitlist entries');
        }
      } catch (error) {
        console.error('Error fetching waitlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, [status, router]);

  // Sync contacts with Brevo
  const syncWithBrevo = async () => {
    try {
      setSyncStatus({ status: 'loading', message: 'Syncing with Brevo...' });
      
      const response = await fetch('/api/admin/brevo/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: waitlistEntries.map(entry => entry.email)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with Brevo');
      }
      
      const data = await response.json();
      
      setSyncStatus({ 
        status: 'success', 
        message: `Successfully synced ${data.synced || 0} contacts with Brevo` 
      });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSyncStatus({ status: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error syncing with Brevo:', error);
      setSyncStatus({ 
        status: 'error', 
        message: 'Error syncing with Brevo. Check console for details.' 
      });
    }
  };

  const exportToCSV = () => {
    if (waitlistEntries.length === 0) {
      alert('No entries to export');
      return;
    }
    
    const headers = ['Email', 'Joined At', 'Source', 'IP Address'];
    const csvData = waitlistEntries.map(entry => [
      entry.email,
      new Date(entry.joinedAt).toLocaleString(),
      entry.source || '',
      entry.ipAddress || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Waitlist Management</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Waitlist Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={syncWithBrevo}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            disabled={syncStatus.status === 'loading'}
          >
            {syncStatus.status === 'loading' && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Sync with Brevo
          </button>
          <button
            onClick={() => router.push('/admin/waitlist/email')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Email to All
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export to CSV
          </button>
        </div>
      </div>
      
      {syncStatus.message && (
        <div className={`mb-4 p-3 rounded-md ${
          syncStatus.status === 'success' ? 'bg-green-100 text-green-800' : 
          syncStatus.status === 'error' ? 'bg-red-100 text-red-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {syncStatus.message}
        </div>
      )}

      {waitlistEntries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No waitlist entries found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {waitlistEntries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(entry.joinedAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{entry.source || 'website'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{entry.ipAddress || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}