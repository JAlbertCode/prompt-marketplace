'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';
import { TrendingUp, Book, Zap } from 'lucide-react';
import PromptCard from '@/components/dashboard/PromptCard';
import PromptFilters from '@/components/dashboard/PromptFilters';
import { getPrompts } from '@/lib/prompts';
import { Prompt } from '@/types/prompt';

export default function CreatorPromptsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filters, setFilters] = useState({ type: 'mine', search: '' });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/creator/prompts');
      return;
    }

    // Fetch user's prompts
    if (status === 'authenticated') {
      const fetchPrompts = async () => {
        try {
          const promptsData = await getPrompts({ type: 'mine' }, sort);
          setPrompts(promptsData);
        } catch (error) {
          console.error('Error fetching prompts:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPrompts();
    }
  }, [status, router, sort]);

  const handleCreatePrompt = () => {
    router.push('/create?tab=prompt');
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
        title="My Prompts"
        description="Manage your created prompts and create new ones"
        tabs={creatorTabs}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Prompts</h2>
          <p className="text-gray-600 mt-1">Create and manage your prompts</p>
        </div>
        <Button onClick={handleCreatePrompt}>
          <Plus className="mr-2" size={16} />
          New Prompt
        </Button>
      </div>

      <PromptFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewChange={handleViewChange}
        view={view}
      />

      {prompts.length === 0 ? (
        <ContentCard className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any prompts yet.</p>
          <Button onClick={handleCreatePrompt} variant="outline">
            <Plus className="mr-2" size={16} />
            Create Your First Prompt
          </Button>
        </ContentCard>
      ) : (
        <div className={`mt-6 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description}
              author={prompt.author}
              tags={prompt.tags}
              isFavorite={prompt.isFavorite}
              createdAt={prompt.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
