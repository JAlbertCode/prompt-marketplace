import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuStar, LuTrash2, LuSettings } from 'react-icons/lu';
import Button from '@/components/shared/Button';
import { toggleFavoritePrompt } from '@/lib/prompts';
import { toast } from 'react-hot-toast';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export default function PromptCard({ 
  id, 
  title, 
  description, 
  author, 
  tags, 
  isFavorite, 
  createdAt 
}: PromptCardProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Only enable client-side features after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      const result = await toggleFavoritePrompt(id);
      setFavorite(result.isFavorite);
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Failed to update favorite status:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/create?tab=prompt&edit=${id}`);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove this prompt?`)) {
      try {
        // API call would go here
        toast.success('Prompt removed');
      } catch (error) {
        console.error('Failed to remove prompt:', error);
        toast.error('Failed to remove prompt');
      }
    }
  };

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/run/${id}`);
  };

  const handleCardClick = () => {
    router.push(`/prompt/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden
      border border-gray-200 transition
      transform hover:-translate-y-1 duration-200
      flex flex-col h-full
      shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
      onClick={handleCardClick}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {title}
          </h3>
          <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
            <button
              onClick={handleFavorite}
              className={`text-sm ${favorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-400`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <LuStar className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleRemoveClick}
              className="text-sm text-red-500 hover:text-red-700"
              aria-label="Remove prompt"
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              className="text-sm text-blue-500 hover:text-blue-700"
              aria-label="Edit prompt"
            >
              <LuSettings className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-2">{author}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 overflow-hidden" title={description}>
          {description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{createdAt}</span>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="primary"
                size="sm"
                onClick={handleRunClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Run Prompt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
