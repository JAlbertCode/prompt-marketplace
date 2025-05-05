"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Database, X, RefreshCw } from 'lucide-react';

export default function DatabaseTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'connected' | 'fallback' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [envVariables, setEnvVariables] = useState<{[key: string]: string | undefined}>({});
  
  useEffect(() => {
    async function checkDatabase() {
      try {
        // Fetch database status
        const response = await fetch('/api/dev/database-status');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setStatus(data.status);
        setDbInfo(data.info || null);
        setEnvVariables(data.env || {});
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    }
    
    checkDatabase();
  }, []);
  
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Force page refresh
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Database Connection Test</h1>
        
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <p className="text-gray-600">Checking database connection...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connection status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Connection Status</h2>
            
            <div className="flex items-center mb-4">
              {status === 'connected' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Connected to database</span>
                </>
              ) : status === 'fallback' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                  <span className="text-amber-700 font-medium">Using fallback mode (mock data)</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">Connection error</span>
                </>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {status === 'fallback' && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-amber-700 text-sm">
                  The application is running in database fallback mode. This means all database 
                  operations will use mock data instead of connecting to a real database.
                </p>
              </div>
            )}
          </div>
          
          {/* Environment Variables */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Environment Configuration</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">USE_DB_FALLBACK:</span>
                <span className={envVariables.USE_DB_FALLBACK === 'true' 
                  ? 'text-amber-600' 
                  : 'text-gray-600'
                }>
                  {envVariables.USE_DB_FALLBACK || 'false'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">USE_LOCAL_STORAGE:</span>
                <span className={envVariables.USE_LOCAL_STORAGE === 'true' 
                  ? 'text-amber-600' 
                  : 'text-gray-600'
                }>
                  {envVariables.USE_LOCAL_STORAGE || 'false'}
                </span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="font-medium">DATABASE_URL:</span>
                <span className="text-gray-600 text-sm ml-4 max-w-lg truncate">
                  {envVariables.DATABASE_URL_MASKED || '[not set]'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Troubleshooting Help */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Troubleshooting</h2>
            
            <div className="space-y-3">
              <p className="text-gray-700">
                If you're experiencing database connection issues, check the following:
              </p>
              
              <ul className="list-disc list-inside text-gray-600 space-y-2 pl-2">
                <li>Verify your database credentials in the <code>.env</code> file</li>
                <li>Ensure your database server is running and accessible</li>
                <li>Check that the database exists and your user has proper permissions</li>
                <li>For cloud databases, confirm your IP is allowed in security settings</li>
              </ul>
              
              <div className="pt-2">
                <a 
                  href="/docs/database-fallback"
                  className="text-blue-600 hover:underline"
                >
                  Read the full troubleshooting guide
                </a>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            
            <div className="space-x-3">
              <button 
                onClick={() => router.push('/dev-utils')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back to Dev Utils
              </button>
              
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test Connection Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
