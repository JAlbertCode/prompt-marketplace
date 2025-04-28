'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePromptStore } from '@/store/usePromptStore';
import { useUnlockedPromptStore } from '@/store/useUnlockedPromptStore';
import { Prompt } from '@/types';
import { LuChevronLeft, LuDownload, LuCopy, LuLock, LuKey } from 'react-icons/lu';
import { copyToClipboard } from '@/lib/shareHelpers';
import { toast } from 'react-hot-toast';

export default function PromptViewPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params?.promptId as string;
  
  const { getPrompt } = usePromptStore();
  const { hasUnlockedPrompt } = useUnlockedPromptStore();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  useEffect(() => {
    if (promptId && getPrompt) {
      // Get the prompt
      const foundPrompt = getPrompt(promptId);
      setPrompt(foundPrompt || null);
      
      // Check if it's unlocked
      if (foundPrompt) {
        setIsUnlocked(hasUnlockedPrompt(promptId));
      }
      
      setLoading(false);
    }
  }, [promptId, getPrompt, hasUnlockedPrompt]);
  
  // Redirect if not unlocked
  useEffect(() => {
    if (!loading && !isUnlocked && !prompt?.ownerId) {
      toast.error('You need to unlock this prompt to view it');
      router.push('/');
    }
  }, [loading, isUnlocked, prompt, router]);
  
  const handleCopySystemPrompt = async () => {
    if (prompt?.systemPrompt) {
      const success = await copyToClipboard(prompt.systemPrompt);
      if (success) {
        toast.success('System prompt copied to clipboard');
      } else {
        toast.error('Failed to copy system prompt');
      }
    }
  };
  
  const handleDownloadSystemPrompt = () => {
    if (prompt?.systemPrompt) {
      // Create a blob
      const blob = new Blob([prompt.systemPrompt], { type: 'text/plain' });
      
      // Create a link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${prompt.title.replace(/\s+/g, '-').toLowerCase()}-system-prompt.txt`;
      
      // Append link to body
      document.body.appendChild(link);
      
      // Click the link
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success('System prompt downloaded');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!prompt) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Prompt Not Found</h1>
        <p className="text-gray-600 mb-6">
          This prompt does not exist or has been removed.
        </p>
        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Go to Home
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <LuChevronLeft className="mr-1" />
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {prompt.title}
              {prompt.isPrivate && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Private
                </span>
              )}
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCopySystemPrompt}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Copy system prompt"
              >
                <LuCopy size={18} />
              </button>
              
              <button
                onClick={handleDownloadSystemPrompt}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Download system prompt"
              >
                <LuDownload size={18} />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {prompt.description}
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <LuKey className="text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">System Prompt</h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap font-mono text-sm">
              {prompt.systemPrompt}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900">Input Fields</h2>
            </div>
            
            <div className="space-y-4">
              {prompt.inputFields.map((field) => (
                <div key={field.id} className="border border-gray-200 rounded-md p-4">
                  <div className="font-medium mb-1">{field.label}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Placeholder: {field.placeholder}
                  </div>
                  <div className="text-xs text-gray-500">
                    {field.required ? 'Required' : 'Optional'} field
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Model: <span className="font-medium">{prompt.model}</span>
            </div>
            
            <Link href={`/run/${prompt.id}`}>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                Run This Prompt
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
