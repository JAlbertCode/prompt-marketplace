import React from 'react';
import Link from 'next/link';
import { Edit, Eye, Star, StarOff, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface PromptsPageProps {
  searchParams: {
    view?: string;
    sort?: string;
    filter?: string;
  };
}

// Function to get user's prompts from Supabase
async function getUserPrompts(userId: string, view = 'all') {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server');
  const supabase = createSupabaseServerClient();
  
  let query = supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Apply filters based on view
  switch (view) {
    case 'drafts':
      query = query.eq('user_id', userId).eq('is_public', false);
      break;
    case 'published':
      query = query.eq('user_id', userId).eq('is_public', true);
      break;
    case 'public':
      query = query.eq('is_public', true);
      break;
    case 'favorites':
      // We would need a favorites table to properly implement this
      query = query.eq('user_id', userId);
      break;
    default:
      // Default to showing user's prompts
      query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
  
  return data || [];
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
  // Authentication check
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login?returnUrl=/dashboard/prompts');
  }
  
  // Get the current view from search params or default to "all"
  const currentView = searchParams.view || 'all';
  
  // Get prompts based on the current view
  const prompts = await getUserPrompts(user.id, currentView);
  
  // Navigation tabs
  const tabs = [
    { id: 'all', label: 'All Prompts' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'published', label: 'Published' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'public', label: 'Public' },
  ];
  
  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and run your AI prompts
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            href="/create/prompt"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Link>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex overflow-x-auto py-1">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              href={`/dashboard/prompts?view=${tab.id}`}
              className={`whitespace-nowrap px-4 py-2 border-b-2 font-medium text-sm ${
                currentView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-gray-500">{prompts.length} prompts</span>
        </div>
        
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="mr-1.5 h-4 w-4" />
            Filter
          </button>
          
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowUpDown className="mr-1.5 h-4 w-4" />
            Sort
          </button>
        </div>
      </div>
      
      {/* Prompts Grid */}
      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{prompt.name}</h3>
                  <button className="text-gray-400 hover:text-yellow-500">
                    <StarOff className="h-5 w-5" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{prompt.description || 'No description provided'}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                      {prompt.model_id}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {prompt.is_public ? 'Public' : 'Private'}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-between">
                <div className="flex space-x-1">
                  <Link
                    href={`/prompt/${prompt.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Run
                  </Link>
                  
                  <Link
                    href={`/create/prompt?id=${prompt.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
                
                {prompt.creator_fee ? (
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      {prompt.creator_fee} credits
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-600 mb-6">
            {currentView === 'public' 
              ? "No public prompts are available at the moment."
              : currentView === 'favorites'
                ? "You haven't favorited any prompts yet."
                : "You haven't created any prompts yet."}
          </p>
          
          <Link
            href="/create/prompt"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first prompt
          </Link>
        </div>
      )}
    </div>
  );
}
