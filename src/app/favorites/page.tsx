'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore'; 
import { useFavoriteStore } from '@/store/useFavoriteStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function FavoritesPage() {
  const router = useRouter();

  // Redirect to dashboard with favorites tab
  React.useEffect(() => {
    router.replace('/dashboard?tab=favoritePrompts');
  }, [router]);

  const { prompts } = usePromptStore();
  const { flows } = useFlowStore();
  const { favorites, clearFavorites } = useFavoriteStore();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("prompts");
  
  // Get favorite prompts and flows
  const favoritePrompts = React.useMemo(() => {
    if (!Array.isArray(prompts) || !Array.isArray(favorites)) return [];
    return prompts.filter(prompt => favorites.includes(prompt.id));
  }, [prompts, favorites]);
  
  const favoriteFlows = React.useMemo(() => {
    if (!Array.isArray(flows) || !Array.isArray(favorites)) return [];
    return flows.filter(flow => favorites.includes(flow.id));
  }, [flows, favorites]);
  
  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      clearFavorites();
      toast.success("All favorites cleared");
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        {session?.user && (
          <p className="text-gray-600 mt-2">
            Your saved prompts and flows
          </p>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("prompts")}
              className={`${
                activeTab === "prompts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Favorite Prompts
            </button>
            <button
              onClick={() => setActiveTab("flows")}
              className={`${
                activeTab === "flows"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Favorite Flows
            </button>
          </nav>
        </div>
      </div>
      
      <div className="flex justify-end mb-4">
        {((activeTab === "prompts" && favoritePrompts.length > 0) || 
          (activeTab === "flows" && favoriteFlows.length > 0)) && (
          <Button
            variant="text"
            onClick={handleClearFavorites}
            className="text-red-600 hover:text-red-800"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {activeTab === "prompts" && (
        favoritePrompts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No favorite prompts yet</h3>
            <p className="text-gray-600 mb-4">Save your favorite prompts for quick access</p>
            <Link href="/">
              <Button>
                Browse Prompts
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoritePrompts.map((prompt) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
              />
            ))}
          </div>
        )
      )}
      
      {activeTab === "flows" && (
        favoriteFlows.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No favorite flows yet</h3>
            <p className="text-gray-600 mb-4">Save your favorite flows for quick access</p>
            <Link href="/">
              <Button>
                Browse Flows
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteFlows.map((flow) => (
              <div
                key={flow.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
              >
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">
                    {flow.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {flow.unlockPrice === null || flow.unlockPrice === 0
                      ? "Free to use"
                      : `Unlock fee: ${flow.unlockPrice} credits`}
                  </p>
                  {flow.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {flow.description}
                    </p>
                  )}
                  <div className="mt-4 flex space-x-3">
                    <Link
                      href={`/flow/${flow.id}`}
                      className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
