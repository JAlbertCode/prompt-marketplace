'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import Button from '@/components/shared/Button';
import { getFlows } from '@/lib/flows';
import { Flow } from '@/types/flow';
import FlowCard from '@/components/dashboard/FlowCard';
import PromptFilters from '@/components/dashboard/PromptFilters';
import { toast } from 'react-hot-toast';

export default function FlowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/flows');
      return;
    }

    // Load flows
    async function loadFlows() {
      setLoading(true);
      try {
        const flowsData = await getFlows(filters, sort);
        setFlows(flowsData);
      } catch (error) {
        console.error('Failed to load flows:', error);
        toast.error('Failed to load flows');
      } finally {
        setLoading(false);
      }
    }

    loadFlows();
  }, [filters, sort, status, router]);

  const handleCreateFlow = () => {
    router.push('/create?tab=flow');
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Flows</h1>
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
          onClick={handleCreateFlow}
        >
          <Plus size={16} />
          Create New Flow
        </Button>
      </div>

      <PromptFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewChange={handleViewChange}
        view={view}
      />

      {flows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mt-6">
          <p className="text-gray-500 mb-4">You don't have any flows yet.</p>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 mx-auto"
            onClick={handleCreateFlow}
          >
            <Plus size={16} />
            Create Your First Flow
          </Button>
        </div>
      ) : (
        <div className={`mt-6 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              id={flow.id}
              title={flow.title}
              description={flow.description}
              author={flow.author}
              steps={flow.steps}
              isFavorite={flow.isFavorite}
              createdAt={flow.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
