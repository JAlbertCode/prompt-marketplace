'use client';

import { useState } from 'react';
import { LuDownload, LuShare2, LuExternalLink, LuRefreshCw } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ShareButtons from '@/components/ui/ShareButtons';

interface ImageDisplayProps {
  imageUrl: string | null;
  alt: string;
  prompt: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onDownload?: () => void;
  promptId: string;
  promptTitle: string;
}

export default function ImageDisplay({
  imageUrl,
  alt,
  prompt,
  isLoading = false,
  onRegenerate,
  onDownload,
  promptId,
  promptTitle
}: ImageDisplayProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDownload = async () => {
    if (!imageUrl) return;
    
    if (onDownload) {
      onDownload();
      return;
    }
    
    try {
      // Create a link element
      const link = document.createElement('a');
      
      // Set the href to the image URL
      link.href = imageUrl;
      
      // Set the download attribute with a filename
      link.download = `${promptTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      
      // Append the link to the body
      document.body.appendChild(link);
      
      // Click the link to trigger the download
      link.click();
      
      // Remove the link from the body
      document.body.removeChild(link);
      
      toast.success('Image downloaded successfully');
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
      toast.error('Failed to download image');
    }
  };
  
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
        <LoadingIndicator size="lg" />
        <p className="mt-4 text-gray-600">Generating image...</p>
      </div>
    );
  }
  
  if (!imageUrl) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
        <p className="text-gray-500">No image generated yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
      <div className="mb-4 flex justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Generated Image
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="p-1 text-gray-500 hover:text-gray-700 transition"
            title="Download image"
          >
            <LuDownload size={18} />
          </button>
          
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-1 text-gray-500 hover:text-gray-700 transition"
              title="Share image"
            >
              <LuShare2 size={18} />
            </button>
            
            {showShareOptions && (
              <div className="absolute right-0 top-8 z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                <ShareButtons 
                  promptId={promptId} 
                  promptTitle={promptTitle} 
                  response={imageUrl} 
                />
              </div>
            )}
          </div>
          
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-gray-500 hover:text-gray-700 transition"
            title="Open in new tab"
          >
            <LuExternalLink size={18} />
          </a>
        </div>
      </div>
      
      <div className="flex justify-center">
        <img 
          src={imageUrl} 
          alt={alt} 
          className="max-w-full h-auto rounded-md shadow-sm"
          style={{ maxHeight: '500px' }}
        />
      </div>
      
      {onRegenerate && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onRegenerate}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <LuRefreshCw size={14} className="mr-1" />
            Regenerate Image
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
