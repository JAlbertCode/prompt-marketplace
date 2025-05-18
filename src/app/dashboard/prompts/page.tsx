import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { checkServerAuth } from '@/lib/auth/helpers/serverAuth';
import { 
  PlusCircle, 
  FolderOpen, 
  Star, 
  Clock, 
  Zap,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  FileText,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

export const metadata = {
  title: 'My Prompts - PromptFlow',
  description: 'Manage your prompts, create new ones, and organize your collection',
};

// Sample prompts data for UI demonstration
const samplePrompts = [
  {
    id: 'prompt1',
    title: 'Customer Support Assistant',
    description: 'A helpful assistant that responds to customer inquiries and resolves issues.',
    tags: ['support', 'customer service'],
    model: 'GPT-4o',
    lastUsed: '2025-05-02T14:30:00Z',
    lastEdited: '2025-04-28T09:15:00Z',
    runs: 42,
    isFavorite: true,
    isPublished: true
  },
  {
    id: 'prompt2',
    title: 'Content Summarizer',
    description: 'Summarizes long articles, documents, or content into concise summaries of varying lengths.',
    tags: ['content', 'productivity'],
    model: 'Sonar Pro Medium',
    lastUsed: '2025-05-04T11:20:00Z',
    lastEdited: '2025-05-01T16:45:00Z',
    runs: 27,
    isFavorite: false,
    isPublished: false
  },
  {
    id: 'prompt3',
    title: 'Product Description Generator',
    description: 'Creates compelling product descriptions from basic product information and features.',
    tags: ['marketing', 'ecommerce'],
    model: 'GPT-4o Mini',
    lastUsed: '2025-04-30T08:45:00Z',
    lastEdited: '2025-04-29T14:20:00Z',
    runs: 15,
    isFavorite: true,
    isPublished: true
  },
  {
    id: 'prompt4',
    title: 'Code Documentation Helper',
    description: 'Generates or improves documentation for code snippets and functions.',
    tags: ['code', 'development', 'documentation'],
    model: 'Sonar Pro High',
    lastUsed: '2025-05-01T17:30:00Z',
    lastEdited: '2025-04-27T10:15:00Z',
    runs: 8,
    isFavorite: false,
    isPublished: false
  },
  {
    id: 'prompt5',
    title: 'Email Drafter',
    description: 'Creates professional email drafts based on tone, purpose and key points.',
    tags: ['email', 'communication'],
    model: 'GPT-4o',
    lastUsed: '2025-05-03T09:10:00Z',
    lastEdited: '2025-05-02T16:30:00Z',
    runs: 32,
    isFavorite: false,
    isPublished: true
  }
];

// Sample collections for organization
const sampleCollections = [
  { id: 'col1', name: 'Marketing', count: 8 },
  { id: 'col2', name: 'Development', count: 5 },
  { id: 'col3', name: 'Content Creation', count: 12 },
  { id: 'col4', name: 'Personal', count: 4 }
];

export default async function PromptsPage() {
  // Check authentication using the same helper that works on the dashboard
  const { isAuthenticated, userId, user } = await checkServerAuth();
  
  if (!isAuthenticated) {
    redirect('/login?returnUrl=/dashboard/prompts');
  }
  
  // Format date for display
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Prompts</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and organize your prompts
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/prompts/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Prompt
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Collections */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">Collections</h2>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    href="/dashboard/prompts"
                    className="flex items-center py-1 px-2 rounded-md bg-blue-50 text-blue-700"
                  >
                    <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="flex-1">All Prompts</span>
                    <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">
                      {samplePrompts.length}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/prompts?favorites=true"
                    className="flex items-center py-1 px-2 rounded-md hover:bg-gray-50 text-gray-700"
                  >
                    <Star className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="flex-1">Favorites</span>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {samplePrompts.filter(p => p.isFavorite).length}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/prompts?recent=true"
                    className="flex items-center py-1 px-2 rounded-md hover:bg-gray-50 text-gray-700"
                  >
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="flex-1">Recently Used</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/prompts?published=true"
                    className="flex items-center py-1 px-2 rounded-md hover:bg-gray-50 text-gray-700"
                  >
                    <Zap className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="flex-1">Published</span>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {samplePrompts.filter(p => p.isPublished).length}
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* User Collections */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium text-gray-900">Your Collections</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  New
                </button>
              </div>
              <ul className="space-y-1">
                {sampleCollections.map(collection => (
                  <li key={collection.id}>
                    <Link
                      href={`/dashboard/prompts?collection=${collection.id}`}
                      className="flex items-center py-1 px-2 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <FolderOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="flex-1">{collection.name}</span>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {collection.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {samplePrompts.length} prompts
                </span>
                <button className="inline-flex items-center px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </button>
                <button className="inline-flex items-center px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                  Sort
                </button>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  List
                </button>
                <button className="px-3 py-1 text-sm bg-blue-50 border border-blue-500 rounded-md text-blue-700">
                  Grid
                </button>
              </div>
            </div>
          </div>
          
          {/* Prompt grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {samplePrompts.map(prompt => (
              <div 
                key={prompt.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-900 truncate">{prompt.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{prompt.description}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {prompt.tags.map(tag => (
                      <span 
                        key={`${prompt.id}-${tag}`}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <button className="text-gray-400 hover:text-yellow-500">
                      <Star className={`h-4 w-4 ${prompt.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                    </button>
                    <span className="ml-2 text-xs text-gray-500">
                      Used {prompt.runs} times
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Link
                      href={`/dashboard/prompts/${prompt.id}/edit`}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/prompts/${prompt.id}/run`}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Run
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg mt-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">12</span> prompts
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  >
                    3
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </a>
                </nav>
              </div>
            </div>
          </div>
          
          {/* Mobile pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:hidden rounded-lg mt-6">
            <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">1</span> of <span className="font-medium">3</span>
            </div>
            <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
          
          {/* Empty state (hidden for now) */}
          <div className="hidden bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">No Prompts Found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You don't have any prompts yet. Create your first prompt to get started.
            </p>
            <Link
              href="/dashboard/prompts/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Prompt
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
