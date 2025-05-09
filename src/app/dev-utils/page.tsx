'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DevUtilsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Database status state
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Check database status on page load
  useEffect(() => {
    if (status === 'authenticated') {
      checkDatabaseStatus();
    }
  }, [status]);
  
  // Function to check database status
  const checkDatabaseStatus = async () => {
    try {
      setDbLoading(true);
      setDbError(null);
      
      const response = await fetch('/api/debug/db-status');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check database status');
      }
      
      const data = await response.json();
      setDbStatus(data);
    } catch (err) {
      console.error('Error checking database status:', err);
      setDbError(err instanceof Error ? err.message : 'Failed to check database status');
    } finally {
      setDbLoading(false);
    }
  };
  
  // We only need to handle setting ADMIN role since everyone is a creator by default
  const makeUserAdmin = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch('/api/admin/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          role: 'ADMIN',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      // Update session with new role
      await update({
        ...session,
        user: {
          ...session.user,
          role: 'ADMIN',
        },
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          
          {dbLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>Checking database status...</span>
            </div>
          ) : dbError ? (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-700 font-medium">Database Error:</p>
              <p className="text-red-700">{dbError}</p>
              <button
                onClick={checkDatabaseStatus}
                className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm"
              >
                Retry
              </button>
            </div>
          ) : dbStatus ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${dbStatus.databaseConnection ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-medium ${dbStatus.databaseConnection ? 'text-green-700' : 'text-red-700'}`}>
                  Connection Status: {dbStatus.databaseConnection ? 'Connected' : 'Failed'}
                </p>
                {!dbStatus.databaseConnection && dbStatus.error && (
                  <p className="text-red-700 mt-2">{dbStatus.error}</p>
                )}
                <p className="text-sm mt-2">
                  Database: {dbStatus.databaseInfo}
                </p>
              </div>
              
              {dbStatus.databaseConnection && (
                <div>
                  <h3 className="font-medium mb-2">Schema Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="mb-2">
                      <span className="font-medium">Credit Bucket Schema:</span> {dbStatus.schemaInfo.hasCreditBucketSchema ? 'Available' : 'Not Found'}
                    </p>
                    
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">Database Tables</summary>
                      <div className="mt-2 ml-2 space-y-1">
                        {dbStatus.schemaInfo.tables && Array.isArray(dbStatus.schemaInfo.tables) ? (
                          dbStatus.schemaInfo.tables.map((table: any, index: number) => (
                            <p key={index} className="text-gray-700">
                              {table.table_name || JSON.stringify(table)}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-700">No tables found or unable to list tables</p>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              )}
              
              <button
                onClick={checkDatabaseStatus}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
              >
                Refresh
              </button>
            </div>
          ) : (
            <button
              onClick={checkDatabaseStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Check Database Status
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
          <p className="mb-4">You need to be logged in to use this page.</p>
          <button
            onClick={() => router.push('/login?returnUrl=/dev-utils')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Configuration</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p><span className="font-medium">ID:</span> {session?.user?.id}</p>
            <p><span className="font-medium">Name:</span> {session?.user?.name}</p>
            <p><span className="font-medium">Email:</span> {session?.user?.email}</p>
            <p><span className="font-medium">Role:</span> {session?.user?.role || 'USER'}</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            On PromptFlow, all users can create and share prompts and flows. Admin privileges are only required for platform management.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
          
          {session?.user?.role === 'ADMIN' ? (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-700 font-medium">
                You currently have admin privileges.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-600">
                Grant yourself admin privileges to access platform management features:
              </p>
              
              <button
                onClick={makeUserAdmin}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Make Admin'}
              </button>
            </>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              <p>Admin access granted successfully!</p>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href="/dashboard"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-center font-medium transition-colors"
            >
              Your Dashboard
            </a>
            {session?.user?.role === 'ADMIN' && (
              <a
                href="/admin/dashboard"
                className="px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded-md text-center font-medium transition-colors"
              >
                Admin Dashboard
              </a>
            )}
            <a
              href="/create/prompt"
              className="px-4 py-3 bg-green-100 hover:bg-green-200 rounded-md text-center font-medium transition-colors"
            >
              Create Prompt
            </a>
            <a
              href="/create/flow"
              className="px-4 py-3 bg-green-100 hover:bg-green-200 rounded-md text-center font-medium transition-colors"
            >
              Create Flow
            </a>
            <a
              href="/dev-utils/database-test"
              className="px-4 py-3 bg-yellow-100 hover:bg-yellow-200 rounded-md text-center font-medium transition-colors sm:col-span-2"
            >
              Database Connection Test
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
