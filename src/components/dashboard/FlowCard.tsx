import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuStar, LuTrash2, LuSettings } from 'react-icons/lu';
import Button from '@/components/shared/Button';
import { toggleFavoriteFlow } from '@/lib/flows';
import { toast } from 'react-hot-toast';

interface FlowCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  steps: { id: string; name: string }[];
  isFavorite: boolean;
  createdAt: string;
}

export default function FlowCard({ 
  id, 
  title, 
  description, 
  author, 
  steps,
  isFavorite, 
  createdAt 
}: FlowCardProps) {
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
      const result = await toggleFavoriteFlow(id);
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
    router.push(`/create?tab=flow&edit=${id}`);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove this flow?`)) {
      try {
        // API call would go here
        toast.success('Flow removed');
      } catch (error) {
        console.error('Failed to remove flow:', error);
        toast.error('Failed to remove flow');
      }
    }
  };

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/flow/${id}/run`);
  };

  const handleCardClick = () => {
    router.push(`/flow/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden
      border border-gray-200 transition
      transform hover:-translate-y-1 duration-200
      flex flex-col h-full
      shadow-[0_2px_8px_rgba(79,70,229,0.25)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]"
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
              aria-label="Remove flow"
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleEdit}
              className="text-sm text-blue-500 hover:text-blue-700"
              aria-label="Edit flow"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Run Flow
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
