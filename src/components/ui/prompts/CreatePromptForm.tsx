'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Prompt } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { createPrompt, publishPrompt } from '@/lib/prompts';

interface CreatePromptFormProps {
  onSubmit?: (promptData: Prompt) => void;
  onCancel?: () => void;
}

const promptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  model: z.string().min(1, 'Model is required'),
  visibility: z.enum(['private', 'public', 'unlisted']),
  tags: z.array(z.string()),
  price: z.number().min(0),
  unlockFee: z.number().min(0),
  isPublished: z.boolean().optional(),
});

export default function CreatePromptForm({ onSubmit, onCancel }: CreatePromptFormProps) {
  const router = useRouter();
  const { addPrompt } = usePromptStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptData, setPromptData] = useState({
    title: '',
    description: '',
    content: '',
    model: '',
    visibility: 'private' as const,
    tags: [] as string[],
    tagInput: '',
    price: 0,
    unlockFee: 0,  // Fee to unlock the system prompt
    isPublished: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPromptData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPromptData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && promptData.tagInput.trim() !== '') {
      e.preventDefault();
      if (!promptData.tags.includes(promptData.tagInput.trim())) {
        setPromptData(prev => ({
          ...prev,
          tags: [...prev.tags, prev.tagInput.trim()],
          tagInput: ''
        }));
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPromptData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!promptData.title || !promptData.content || !promptData.model) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Parse price as number
      const price = typeof promptData.price === 'string' 
        ? parseInt(promptData.price, 10) || 0 
        : promptData.price;

      // Parse unlock fee as number
      const unlockFee = typeof promptData.unlockFee === 'string'
        ? parseInt(promptData.unlockFee, 10) || 0
        : promptData.unlockFee;

      // Create the prompt via API
      const newPrompt = await createPrompt({
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        model: promptData.model,
        visibility: promptData.visibility,
        tags: promptData.tags,
        price,
        unlockFee,
        isPublished: false, // Start as unpublished, we'll publish separately if needed
      });

      console.log('Created prompt:', newPrompt);

      // Directly add to Zustand store
      const promptId = addPrompt(newPrompt);
      console.log('Added to store with ID:', promptId);

      // If the user wants to publish, do that as a separate step
      if (promptData.isPublished) {
        toast.loading('Publishing prompt to marketplace...', {
          id: 'publishing-prompt',
        });

        const publishResult = await publishPrompt(newPrompt.id);
        
        if (!publishResult.success) {
          toast.error(`Failed to publish: ${publishResult.error}`, {
            id: 'publishing-prompt',
          });
          // Continue with the process even if publishing fails
        } else {
          toast.success('Prompt published successfully!', {
            id: 'publishing-prompt',
          });
          // Update the prompt in the store with the published status
          if (publishResult.prompt) {
            addPrompt({
              ...newPrompt,
              isPublished: true,
              exampleOutput: publishResult.exampleOutput || null,
            });
          }
        }
      } else {
        toast.success('Prompt created successfully');
      }
      
      if (onSubmit) {
        onSubmit(newPrompt);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to create prompt:', error);
      toast.error('Failed to create prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input 
          id="title" 
          name="title"
          value={promptData.title}
          onChange={handleChange}
          placeholder="Enter a descriptive title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description"
          value={promptData.description}
          onChange={handleChange}
          placeholder="Describe what your prompt does"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Prompt Content *</Label>
        <Textarea 
          id="content" 
          name="content"
          value={promptData.content}
          onChange={handleChange}
          placeholder="Write your prompt content here..."
          rows={8}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Model *</Label>
        <Select 
          onValueChange={(value) => handleSelectChange('model', value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
            <SelectItem value="sonar-pro-medium">Sonar Pro Medium</SelectItem>
            <SelectItem value="sonar-reasoning-pro">Sonar Reasoning Pro</SelectItem>
            <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div>
          <Input 
            id="tagInput" 
            name="tagInput"
            value={promptData.tagInput}
            onChange={handleChange}
            onKeyDown={handleAddTag}
            placeholder="Add tag and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {promptData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="px-2 py-1">
                {tag}
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="ml-1 h-4 w-4"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select 
          defaultValue="private"
          onValueChange={(value) => handleSelectChange('visibility', value as 'private' | 'public' | 'unlisted')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Run Price (in credits)</Label>
        <Input 
          id="price" 
          name="price"
          type="number"
          min="0"
          value={promptData.price.toString()}
          onChange={handleChange}
          placeholder="0 for free"
        />
        <p className="text-xs text-gray-500">Set to 0 for free access</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="unlockFee">System Prompt Unlock Fee (in credits)</Label>
        <Input 
          id="unlockFee" 
          name="unlockFee"
          type="number"
          min="0"
          value={promptData.unlockFee.toString()}
          onChange={handleChange}
          placeholder="0 for free access to the system prompt"
        />
        <p className="text-xs text-gray-500">Fee to unlock and view the system prompt (0 for free)</p>
      </div>
      
      
      <div className="flex justify-between mt-8">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel || (() => router.back())}
        >
          Cancel
        </Button>
        <div className="space-x-2">
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Prompt'}
          </Button>
          <Button 
            type="button"
            variant="secondary"
            onClick={() => {
              setPromptData(prev => ({ ...prev, isPublished: true }));
              handleSubmit(new Event('submit') as any);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Create & Publish'}
          </Button>
        </div>
      </div>
    </form>
  );
}
