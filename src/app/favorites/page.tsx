'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import { useFavoriteStore } from '@/store/useFavoriteStore';
import PromptCard from '@/components/ui/PromptCard';
import Button from '@/components/shared/Button';

export default function FavoritesPage() {
  const { prompts } = usePromptStore();
  const { favorites, clearFavorites } = useFavoriteStore();
  
  // Get favorite prompts
  const favoritePrompts = useMemo(() => {
    if (!Array.isArray(prompts) || !Array.isArray(favorites)) return [];
    
    return prompts.filter(prompt => favorites.includes(prompt.id));
  }, [prompts, favorites]);
  
  const handleClearFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      clearFavorites();
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Favorite Prompts
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quick access to prompts you've favorited
          </p>
        </div>
        
        <div className="flex space-x-2">
          {favoritePrompts.length > 0 && (
            <button 
              onClick={handleClearFavorites}
              className="text-xs text-red-600 hover:text-red-800 hover:underline"
            >
              Clear All
            </button>
          )}
          <Link href="/">
            <Button variant="outline">
              Browse All Prompts
            </Button>
          </Link>
        </div>
      </div>
      
      {favoritePrompts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No favorites yet</h3>
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
      )}
    </div>
  );
}
