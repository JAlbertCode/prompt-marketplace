'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';
import { TrendingUp, Book, Zap } from 'lucide-react';
import FlowCard from '@/components/dashboard/FlowCard';
import PromptFilters from '@/components/dashboard/PromptFilters';
import { getFlows } from '@/lib/flows';
import { Flow } from '@/types/flow';

export default function CreatorFlowsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [filters, setFilters] = useState({ type: 'mine', search: '' });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/creator/flows');
      return;
    }

    // Fetch user's flows
    if (status === 'authenticated') {
      const fetchFlows = async () => {
        try {
          const flowsData = await getFlows({ type: 'mine' }, sort);
          setFlows(flowsData);
        } catch (error) {
          console.error('Error fetching flows:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchFlows();
    }
  }, [status, router, sort]);

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

  // Define creator navigation tabs
  const creatorTabs = [
    { href: '/dashboard/creator', label: 'Overview', icon: TrendingUp },
    { href: '/dashboard/creator/prompts', label: 'My Prompts', icon: Book },
    { href: '/dashboard/creator/flows', label: 'My Flows', icon: Zap },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="My Flows"
        description="Manage your created flows and create new ones"
        tabs={creatorTabs}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Flows</h2>
          <p className="text-gray-600 mt-1">Create and manage your flows</p>
        </div>
        <Button onClick={handleCreateFlow}>
          <Plus className="mr-2" size={16} />
          New Flow
        </Button>
      </div>

      <PromptFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewChange={handleViewChange}
        view={view}
      />

      {flows.length === 0 ? (
        <ContentCard className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any flows yet.</p>
          <Button onClick={handleCreateFlow} variant="outline">
            <Plus className="mr-2" size={16} />
            Create Your First Flow
          </Button>
        </ContentCard>
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
