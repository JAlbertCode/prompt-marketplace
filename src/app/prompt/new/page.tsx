'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft } from 'lucide-react';
import { createPrompt } from '@/lib/prompts';
import { toast } from 'sonner';

export default function NewPromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [promptData, setPromptData] = useState({
    title: '',
    description: '',
    content: '',
    model: '',
    visibility: 'private',
    tags: [] as string[],
    tagInput: '',
    price: 0,
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
      // Validate form
      if (!promptData.title || !promptData.content || !promptData.model) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Create prompt
      await createPrompt({
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        model: promptData.model,
        visibility: promptData.visibility,
        tags: promptData.tags,
        price: promptData.price,
      });

      toast.success('Prompt created successfully');
      router.push('/dashboard/creator/prompts');
    } catch (error) {
      console.error('Failed to create prompt:', error);
      toast.error('Failed to create prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 flex items-center gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <h1 className="text-2xl font-semibold mb-6">Create New Prompt</h1>
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
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
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Prompt Content *</Label>
              <Textarea 
                id="content" 
                name="content"
                value={promptData.content}
                onChange={handleChange}
                placeholder="Write your prompt content here..."
                rows={12}
                required
              />
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                defaultValue="private"
                onValueChange={(value) => handleSelectChange('visibility', value)}
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
              <Label htmlFor="price">Price (in credits)</Label>
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
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-8">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
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
          </div>
        </div>
      </form>
    </div>
  );
}
