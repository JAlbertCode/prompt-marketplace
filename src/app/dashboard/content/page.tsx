'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Filter, ArrowUpDown, Grid, List, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/authContext';
import Loader from '@/components/ui/Loader';
import { toast } from 'react-hot-toast';

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  model_id: string;
  created_at: string;
  creator_fee: number;
  creator_id: string;
  updated_at: string;
  is_public: boolean;
  tags: string[];
};

type ContentViewMode = 'grid' | 'list';

export default function ContentPage() {
  const router = useRouter();
  const { data: session, status: nextAuthStatus } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [viewMode, setViewMode] = useState<ContentViewMode>('grid');
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({ favorites: false, search: '' });
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');
  
  // Determine authentication status from either auth system
  const isAuthenticated = !!session?.user || !!supabaseUser;
  const isAuthLoading = nextAuthStatus === 'loading' || supabaseLoading;
  const userId = session?.user?.id || supabaseUser?.id || null;
  
  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent('/dashboard/content');
      router.replace(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    // Load the user's prompts from Supabase via API
    async function loadPrompts() {
      if (!userId) return;
      
      setLoading(true);
      try {
        console.log('Loading prompts for user:', userId);
        
        // First try to load from Supabase via API
        const response = await fetch(`/api/prompts/user?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prompts from API');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch prompts');
        }
        
        // Set the prompts from the API
        setPrompts(data.prompts);
        console.log(`Found ${data.prompts.length} prompts`);
        
      } catch (apiError) {
        console.error('Error loading prompts from API:', apiError);
        toast.error('Could not load prompts from database');
        
        // Fallback to using local storage prompts
        try {
          // Create query for prompts owned by this user
          let query = supabase
            .from('prompts')
            .select('*')
            .eq('creator_id', userId);
          
          // Apply filters if needed
          if (filters.favorites) {
            // We would need a favorites join here
            // For now just returning all
          }
          
          // Apply sorting
          if (sort === 'newest') {
            query = query.order('created_at', { ascending: false });
          } else if (sort === 'oldest') {
            query = query.order('created_at', { ascending: true });
          } else if (sort === 'name_asc') {
            query = query.order('title', { ascending: true });
          } else if (sort === 'name_desc') {
            query = query.order('title', { ascending: false });
          }
          
          const { data, error } = await query;
          
          if (error) {
            throw error;
          }
          
          // Process results - ensure tags field is an array
          const processedPrompts = data.map(prompt => ({
            ...prompt,
            tags: Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags ? JSON.parse(prompt.tags) : [])
          }));
          
          setPrompts(processedPrompts);
          console.log(`Found ${processedPrompts.length} prompts in direct Supabase call`);
        } catch (error) {
          console.error('Error loading prompts from direct Supabase:', error);
          toast.error('Failed to load prompts');
          setPrompts([]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (isAuthenticated && userId) {
      loadPrompts();
    }
  }, [userId, isAuthenticated, isAuthLoading, refreshKey, filters, sort, router]);
  
  const handleCreatePrompt = () => {
    router.push('/create');
  };
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Refreshing content');
  };
  
  // Show loading state while checking authentication or loading prompts
  if (isAuthLoading || loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader size="large" message="Loading your content..." />
      </div>
    );
  }
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[400px]">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your content.</p>
          <button
            onClick={() => router.push(`/login?returnUrl=${encodeURIComponent('/dashboard/content')}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">My Content</h1>
          <p className="text-gray-600 mt-1">
            All your prompts, flows, and templates
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
          
          <button
            onClick={handleCreatePrompt}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </button>
        </div>
      </div>
      
      {/* Filters and view controls */}
      <div className="bg-white rounded-lg p-4 shadow mb-6 flex flex-col sm:flex-row justify-between">
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <span className="text-sm text-gray-600">{prompts.length} items</span>
          
          <button 
            className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setFilters(f => ({ ...f, favorites: !f.favorites }))}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filters.favorites ? 'All Prompts' : 'Favorites'}
          </button>
          
          <button 
            className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sort === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className={`px-2 py-1 text-sm rounded-md ${viewMode === 'list' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            className={`px-2 py-1 text-sm rounded-md ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'border border-gray-300'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Content display */}
      {prompts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium mb-2">No content yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't created any prompts or flows yet. Start by creating your first prompt.
          </p>
          <button
            onClick={handleCreatePrompt}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Prompt
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {prompts.map(prompt => (
            <div
              key={prompt.id}
              className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex items-center p-4' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="p-5">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-medium truncate">{prompt.title}</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {prompt.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {prompt.tags.map((tag, index) => (
                          <span
                            key={`${prompt.id}-tag-${index}`}
                            className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Model: {prompt.model_id}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/prompt/${prompt.id}/edit`}
                        className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/prompt/${prompt.id}`}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <h3 className="font-medium truncate">{prompt.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {prompt.description || 'No description'}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                    <Link
                      href={`/prompt/${prompt.id}/edit`}
                      className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/prompt/${prompt.id}`}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}