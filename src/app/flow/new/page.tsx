'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Plus } from 'lucide-react';

// Simple placeholder for New Flow page
export default function NewFlowPage() {
  const router = useRouter();

  // Handle back button click
  const handleBackClick = () => {
    router.push('/dashboard/flows');
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Create New Flow</h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Basic Details</h2>
        <p className="text-sm text-gray-500 mb-4">
          Set up the basic information for your new flow
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input 
              id="title" 
              placeholder="Enter a title for your flow" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              id="description" 
              placeholder="Describe what this flow does" 
              rows={3} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
            <select
              id="visibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <p className="text-xs text-gray-500">
              Private flows are only visible to you
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button 
          onClick={handleBackClick}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Continue
        </button>
      </div>
    </div>
  );
}