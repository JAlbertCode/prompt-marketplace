import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Edit, Play } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toggleFavoriteFlow } from '@/lib/flows';
import { toast } from 'sonner';

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

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/flow/${id}/run`);
  };

  const handleCardClick = () => {
    router.push(`/flow/${id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg truncate">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${favorite ? 'text-red-500' : 'text-gray-400'}`}
            onClick={handleFavorite}
            disabled={isLoading}
          >
            <Heart className={`${favorite ? 'fill-current' : ''}`} size={18} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{author}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Steps: {steps.length}</p>
          <ul className="text-xs text-gray-600">
            {steps.slice(0, 3).map((step, index) => (
              <li key={step.id} className="truncate">
                {index + 1}. {step.name}
              </li>
            ))}
            {steps.length > 3 && (
              <li className="text-gray-400">+ {steps.length - 3} more steps</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <span className="text-xs text-gray-500">{createdAt}</span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRun}
            className="flex items-center gap-1"
          >
            <Play size={14} />
            Run
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="mr-2" size={14} />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
