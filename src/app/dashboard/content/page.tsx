'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ListTodo, Filter } from 'lucide-react';
import Button from '@/components/shared/Button';
import { getPrompts } from '@/lib/prompts';
import { getFlows } from '@/lib/flows';
import { Prompt } from '@/types/prompt';
import { Flow } from '@/types/flow';
import PromptCard from '@/components/dashboard/PromptCard';
import FlowCard from '@/components/dashboard/FlowCard';
import PromptFilters from '@/components/dashboard/PromptFilters';
import { toast } from 'react-hot-toast';

type ContentType = 'all' | 'prompts' | 'flows';

export default function ContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [contentType, setContentType] = useState<ContentType>('all');
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/dashboard/content');
      return;
    }

    // Load user content
    async function loadContent() {
      setLoading(true);
      try {
        // Load prompts if needed
        if (contentType === 'all' || contentType === 'prompts') {
          const promptsData = await getPrompts({ ...filters, type: 'mine' }, sort);
          setPrompts(promptsData);
        }

        // Load flows if needed
        if (contentType === 'all' || contentType === 'flows') {
          const flowsData = await getFlows({ ...filters, type: 'mine' }, sort);
          setFlows(flowsData);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        toast.error('Failed to load your content');
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [contentType, filters, sort, status, router]);

  const handleCreatePrompt = () => {
    router.push('/create?tab=prompt');
  };

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

  const getFilteredContent = () => {
    if (contentType === 'prompts') {
      return { items: prompts, type: 'prompts' };
    } else if (contentType === 'flows') {
      return { items: flows, type: 'flows' };
    } else {
      // For 'all', we need to combine and sort
      const combined = [
        ...prompts.map(p => ({ ...p, itemType: 'prompt' as const })),
        ...flows.map(f => ({ ...f, itemType: 'flow' as const }))
      ];

      // Sort combined items
      if (sort === 'oldest') {
        combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sort === 'most-used') {
        combined.sort((a, b) => (b.runs || 0) - (a.runs || 0));
      } else {
        // Default: newest first
        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return { items: combined, type: 'all' };
    }
  };

  const { items, type } = getFilteredContent();

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
        <h1 className="text-2xl font-bold">My Content</h1>
        <div className="flex gap-2">
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
            onClick={handleCreatePrompt}
          >
            <Plus size={16} />
            New Prompt
          </Button>
          <Button 
            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2"
            onClick={handleCreateFlow}
          >
            <Plus size={16} />
            New Flow
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg mb-6 border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="font-medium">Filter by:</div>
          <div className="flex gap-2">
            <Button 
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                contentType === 'all' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
              onClick={() => setContentType('all')}
            >
              All Content
            </Button>
            <Button 
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                contentType === 'prompts' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
              onClick={() => setContentType('prompts')}
            >
              <FileText size={16} />
              Prompts Only
            </Button>
            <Button 
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                contentType === 'flows' 
                  ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
              onClick={() => setContentType('flows')}
            >
              <ListTodo size={16} />
              Flows Only
            </Button>
          </div>
        </div>
      </div>

      <PromptFilters 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onViewChange={handleViewChange}
        view={view}
      />

      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mt-6">
          <p className="text-gray-500 mb-4">
            {type === 'prompts' 
              ? "You don't have any prompts yet." 
              : type === 'flows' 
                ? "You don't have any flows yet."
                : "You don't have any content yet."}
          </p>
          <div className="flex justify-center gap-4">
            {(type === 'all' || type === 'prompts') && (
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
                onClick={handleCreatePrompt}
              >
                <Plus size={16} />
                Create Prompt
              </Button>
            )}
            {(type === 'all' || type === 'flows') && (
              <Button 
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2"
                onClick={handleCreateFlow}
              >
                <Plus size={16} />
                Create Flow
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className={`mt-6 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {items.map((item) => {
            if (type === 'prompts') {
              return (
                <PromptCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  author={item.author}
                  tags={item.tags}
                  isFavorite={item.isFavorite}
                  createdAt={item.createdAt}
                />
              );
            } else if (type === 'flows') {
              return (
                <FlowCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  author={item.author}
                  steps={(item as Flow).steps}
                  isFavorite={item.isFavorite}
                  createdAt={item.createdAt}
                />
              );
            } else {
              // For combined content
              const combinedItem = item as (Prompt | Flow) & { itemType: 'prompt' | 'flow' };
              
              if (combinedItem.itemType === 'prompt') {
                return (
                  <div key={combinedItem.id} className="relative">
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full z-10">
                      Prompt
                    </div>
                    <PromptCard
                      id={combinedItem.id}
                      title={combinedItem.title}
                      description={combinedItem.description}
                      author={combinedItem.author}
                      tags={combinedItem.tags}
                      isFavorite={combinedItem.isFavorite}
                      createdAt={combinedItem.createdAt}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={combinedItem.id} className="relative">
                    <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full z-10">
                      Flow
                    </div>
                    <FlowCard
                      id={combinedItem.id}
                      title={combinedItem.title}
                      description={combinedItem.description}
                      author={combinedItem.author}
                      steps={(combinedItem as Flow).steps}
                      isFavorite={combinedItem.isFavorite}
                      createdAt={combinedItem.createdAt}
                    />
                  </div>
                );
              }
            }
          })}
        </div>
      )}
    </div>
  );
}
