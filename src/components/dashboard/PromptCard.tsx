import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuStar, LuTrash2, LuSettings, LuGlobe } from 'react-icons/lu';
import Button from '@/components/shared/Button';
import { toggleFavoritePrompt, publishPrompt } from '@/lib/prompts';
import { toast } from 'react-hot-toast';

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  isFavorite: boolean;
  isPublished?: boolean;
  createdAt: string;
}

export default function PromptCard({ 
  id, 
  title, 
  description, 
  author, 
  tags, 
  isFavorite, 
  isPublished = false,
  createdAt 
}: PromptCardProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [published, setPublished] = useState(isPublished);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (published) {
      toast.info('This prompt is already published');
      return;
    }
    
    setIsPublishing(true);
    toast.loading('Publishing prompt...', { id: 'publish-toast' });
    
    try {
      const result = await publishPrompt(id);
      
      if (result.success) {
        setPublished(true);
        toast.success('Prompt published successfully', { id: 'publish-toast' });
      } else {
        toast.error(`Failed to publish: ${result.error || 'Unknown error'}`, { id: 'publish-toast' });
      }
    } catch (error) {
      console.error('Failed to publish prompt:', error);
      toast.error('Failed to publish prompt', { id: 'publish-toast' });
    } finally {
      setIsPublishing(false);
    }
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
          <h3 className="text-lg font-semibold text-gray-800 truncate flex items-center">
            {title}
            {published && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                <LuGlobe className="h-3 w-3 mr-1" />
                Published
              </span>
            )}
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
            {!published && (
              <button
                onClick={handlePublish}
                className="text-sm text-green-500 hover:text-green-700"
                aria-label="Publish prompt"
                disabled={isPublishing}
                title="Publish to marketplace"
              >
                {isPublishing ? (
                  <svg className="animate-spin h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <LuGlobe className="h-4 w-4" />
                )}
              </button>
            )}
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
