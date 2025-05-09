'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Network, Play, Plus, RotateCcw, Settings } from 'lucide-react';
import Button from '@/components/shared/Button';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AutomationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [automations, setAutomations] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/automations');
      return;
    }

    // Simulated loading of automations
    const timer = setTimeout(() => {
      setLoading(false);
      // For now, we'll set empty automations since this is a placeholder
      setAutomations([]);
    }, 500);

    return () => clearTimeout(timer);
  }, [status, router]);

  const handleCreateAutomation = () => {
    // Redirect to flows creation page
    router.push('/create?tab=flow');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Network className="h-6 w-6 mr-2 text-indigo-600" />
          <h1 className="text-2xl font-bold">Automations</h1>
        </div>
        
        <Button 
          variant="primary"
          className="flex items-center gap-2"
          onClick={handleCreateAutomation}
        >
          <Plus size={16} />
          Create Automation
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Automation Insights</h2>
        <p className="text-gray-600 mb-4">
          Use PromptFlow's automation capabilities to chain prompts together and 
          integrate with your existing workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium mb-1">Total Automations</h3>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Start creating your first automation</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium mb-1">Monthly Runs</h3>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium mb-1">Credit Usage</h3>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">Credits used for automations</p>
          </div>
        </div>
      </div>

      {automations.length === 0 ? (
        <EmptyState
          title="No automations yet"
          description="Create your first automation by chaining prompts together into a flow."
          icon={<Network className="h-12 w-12 text-gray-400" />}
          action={
            <Button 
              variant="primary"
              onClick={handleCreateAutomation}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create Automation
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This would render automation cards if there were any */}
        </div>
      )}

      <div className="mt-8 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">Pro Tip: Automation Bonuses</h3>
        <p className="text-indigo-700 mb-4">
          Running automations regularly earns you bonus credits. The more you automate,
          the more credits you get each month!
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-indigo-900">Monthly Burn</div>
            <div className="font-semibold text-indigo-900">Bonus Credits</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div>100K - 299K credits</div>
              <div>10,000 credits</div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div>300K - 599K credits</div>
              <div>40,000 credits</div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div>600K - 999K credits</div>
              <div>100,000 credits</div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div>≥1.4M credits</div>
              <div>400,000 credits (Enterprise)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
