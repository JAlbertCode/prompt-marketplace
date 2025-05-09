import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Key, Copy, Eye, EyeOff, DownloadCloud, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'API Keys - PromptFlow',
  description: 'Manage your API keys for programmatic access to PromptFlow',
};

// Sample API key data
const apiKeys = [
  {
    id: 'key1',
    name: 'Production',
    prefix: 'pfk_prod_',
    suffix: 'a1b2c3',
    created: '2025-04-10T14:30:00Z',
    lastUsed: '2025-05-04T16:42:00Z',
    permissions: ['read', 'write', 'execute'],
  },
  {
    id: 'key2',
    name: 'Development',
    prefix: 'pfk_dev_',
    suffix: 'd4e5f6',
    created: '2025-04-22T09:15:00Z',
    lastUsed: '2025-05-05T08:21:00Z',
    permissions: ['read', 'write'],
  }
];

export default async function ApiKeysPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings/api-keys');
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate time ago for display
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-gray-600 mt-1">
          Manage your API keys for programmatic access to PromptFlow
        </p>
      </div>
      
      <div className="space-y-6">
        {/* API key explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Using API Keys
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  API keys allow you to access the PromptFlow API programmatically. Keep your API keys secure and never share them publicly.
                </p>
                <p className="mt-2">
                  <a 
                    href="/docs/api" 
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View API documentation
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* API keys list */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="font-medium">Your API Keys</h2>
          </div>
          
          <div className="divide-y">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium text-gray-900">{key.name}</div>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Created {formatDate(key.created)} • Last used {timeAgo(key.lastUsed)}
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {key.prefix}••••••••••••{key.suffix}
                      </div>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Copy API key"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="Reveal API key"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-shrink-0">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    <button className="ml-3 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                      Revoke
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Permissions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {key.permissions.map((permission) => (
                      <span 
                        key={`${key.id}-${permission}`}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                        {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Create new API key */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Create New API Key</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                Key Name
              </label>
              <input
                id="keyName"
                type="text"
                placeholder="e.g., Production, Development, Testing"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Give your key a descriptive name to remember what it's used for
              </p>
            </div>
            
            <div>
              <label htmlFor="keyExpiration" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <select
                id="keyExpiration"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="never">Never</option>
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="custom">Custom date</option>
              </select>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Permissions
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="permRead"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="permRead" className="ml-2 block text-sm text-gray-700">
                    Read (access prompts and data)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="permWrite"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="permWrite" className="ml-2 block text-sm text-gray-700">
                    Write (create and modify prompts)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="permExecute"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="permExecute" className="ml-2 block text-sm text-gray-700">
                    Execute (run prompts and flows)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="permBilling"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="permBilling" className="ml-2 block text-sm text-gray-700">
                    Billing (manage credits and payment methods)
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Credit Limits
              </div>
              <div className="flex items-center">
                <input
                  id="limitCredits"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="limitCredits" className="ml-2 block text-sm text-gray-700">
                  Set a credit usage limit for this API key
                </label>
              </div>
              <div className="mt-2 ml-6">
                <input
                  id="creditLimit"
                  type="number"
                  placeholder="e.g., 1000000"
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of credits this key can use
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
        
        {/* API usage and documentation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Usage Examples</h2>
            <div className="bg-gray-50 rounded-md p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`// Node.js example
const promptflow = require('promptflow');
const client = new promptflow.Client({
  apiKey: 'your_api_key_here'
});

// Run a prompt
const result = await client.prompts.run({
  promptId: 'prompt_123456',
  input: 'Tell me about AI'
});

console.log(result);`}
              </pre>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <a href="/docs/api/examples" className="text-blue-600 hover:text-blue-500">
                See more examples →
              </a>
            </div>
          </div>
          
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">API Security Best Practices</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span>Never hardcode API keys in your source code</span>
              </li>
              <li className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span>Use environment variables to store your API keys</span>
              </li>
              <li className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span>Rotate your API keys regularly</span>
              </li>
              <li className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span>Set appropriate permissions for each key</span>
              </li>
              <li className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                <span>Use different keys for development and production</span>
              </li>
            </ul>
            <div className="mt-4 text-sm text-gray-500">
              <a href="/docs/api/security" className="text-blue-600 hover:text-blue-500">
                Learn more about API security →
              </a>
            </div>
          </div>
        </div>
        
        {/* Audit log */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">API Key Activity Log</h2>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-500">
              <DownloadCloud className="h-4 w-4 mr-1" />
              Export Log
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Development
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Prompt execution
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    192.168.1.100
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Yesterday
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Production
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Flow execution
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    203.0.113.42
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 days ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Production
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Prompt creation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    203.0.113.42
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <a href="/settings/api-keys/logs" className="text-blue-600 hover:text-blue-500">
              View full activity log →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
