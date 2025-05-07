'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bookmark, Grid, List, Plus, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from '@/components/shared/Button';
import { getFavoritePrompts } from '@/lib/prompts';
import { getFavoriteFlows } from '@/lib/flows';
import { Prompt } from '@/types/prompt';
import { Flow } from '@/types/flow';
import ItemCard from '@/components/ui/ItemCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import { toast } from 'react-hot-toast';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/login?returnUrl=/favorites');
      return;
    }

    // Load user's favorite content
    async function loadFavorites() {
      setLoading(true);
      try {
        // Load both prompts and flows
        const promptsData = await getFavoritePrompts();
        const flowsData = await getFavoriteFlows();
        
        setPrompts(promptsData);
        setFlows(flowsData);
      } catch (error) {
        console.error('Failed to load favorites:', error);
        toast.error('Failed to load your favorites');
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [status, router]);

  // Get visible items based on active tab and sort
  const getVisibleItems = () => {
    let items = [];
    
    if (activeTab === 'all' || activeTab === 'prompts') {
      items = [...items, ...prompts.map(p => ({ ...p, itemType: 'prompt' as const }))];
    }
    
    if (activeTab === 'all' || activeTab === 'flows') {
      items = [...items, ...flows.map(f => ({ ...f, itemType: 'flow' as const }))];
    }
    
    // Apply sorting
    if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'name') {
      items.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: newest
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return items;
  };

  const visibleItems = getVisibleItems();

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
          <Bookmark className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">My Favorites</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="px-2 py-1"
            onClick={() => handleViewChange(view === 'grid' ? 'list' : 'grid')}
          >
            {view === 'grid' ? <List size={18} /> : <Grid size={18} />}
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              className="px-2 py-1"
            >
              <SlidersHorizontal size={18} />
            </Button>
            
            {/* Sort dropdown would go here */}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="all" 
            className={`px-4 py-2 rounded-md ${activeTab === 'all' ? 'bg-white shadow-sm' : ''}`}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="prompts" 
            className={`px-4 py-2 rounded-md ${activeTab === 'prompts' ? 'bg-white shadow-sm' : ''}`}
          >
            Prompts
          </TabsTrigger>
          <TabsTrigger 
            value="flows" 
            className={`px-4 py-2 rounded-md ${activeTab === 'flows' ? 'bg-white shadow-sm' : ''}`}
          >
            Flows
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {visibleItems.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="When you favorite prompts and flows, they'll appear here for easy access."
          icon={<Bookmark className="h-12 w-12 text-gray-400" />}
          action={
            <Button 
              variant="primary"
              onClick={() => router.push('/marketplace')}
            >
              Explore Marketplace
            </Button>
          }
        />
      ) : (
        <div className={view === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {visibleItems.map((item) => (
            <div key={`${item.itemType}-${item.id}`}>
              <ItemCard
                item={item}
                itemType={item.itemType}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
