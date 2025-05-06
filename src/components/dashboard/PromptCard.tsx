import React, { useState } from 'react';
import Button from "@/components/shared/Button";
import { Heart, Edit } from "lucide-react";
import { useRouter } from 'next/navigation';
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

  const handleCardClick = () => {
    router.push(`/prompt/${id}`);
  };

  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg truncate">{title}</h3>
          <Button 
            variant="ghost" 
            className={`p-1 ${favorite ? 'text-red-500' : 'text-gray-400'}`}
            onClick={handleFavorite}
            disabled={isLoading}
          >
            <Heart className={`${favorite ? 'fill-current' : ''}`} size={18} />
          </Button>
        </div>
        <p className="text-sm text-gray-500">{author}</p>
      </div>
      
      <div className="px-4 py-2">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-500">{createdAt}</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEdit}
        >
          <Edit className="mr-2" size={14} />
          Edit
        </Button>
      </div>
    </div>
  );
}
