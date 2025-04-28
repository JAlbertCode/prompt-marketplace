'use client';

import { useState } from 'react';
import { LuShare2, LuCopy, LuLink, LuCheck, LuTwitter, LuMail } from 'react-icons/lu';
import { generateShareUrl, shareResponse, copyToClipboard } from '@/lib/shareHelpers';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  promptId: string;
  promptTitle: string;
  response: string;
  compact?: boolean;
}

export default function ShareButtons({ 
  promptId, 
  promptTitle, 
  response,
  compact = false
}: ShareButtonsProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const shareUrl = generateShareUrl(promptId, response, promptTitle);
  
  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      setIsCopied(true);
      toast.success('Link copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };
  
  const handleShare = async () => {
    const success = await shareResponse(
      `PromptFlow: ${promptTitle}`,
      `Check out this AI response from PromptFlow: ${promptTitle}`,
      shareUrl
    );
    
    if (success) {
      toast.success('Shared successfully');
      setShowOptions(false);
    }
  };
  
  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(`Check out this AI response from PromptFlow: ${promptTitle}`);
    const tweetUrl = encodeURIComponent(shareUrl);
    
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
      '_blank'
    );
    
    setShowOptions(false);
  };
  
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`PromptFlow: ${promptTitle}`);
    const body = encodeURIComponent(`Check out this AI response from PromptFlow: ${promptTitle}\n\n${shareUrl}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowOptions(false);
  };
  
  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm"
          aria-label="Share response"
        >
          <LuShare2 size={16} />
          <span>Share</span>
        </button>
        
        {showOptions && (
          <div className="absolute z-10 mt-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-40">
            <button
              onClick={handleCopyLink}
              className="flex items-center w-full space-x-2 p-2 text-left text-sm hover:bg-gray-100 rounded"
            >
              {isCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
              <span>{isCopied ? 'Copied!' : 'Copy link'}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center w-full space-x-2 p-2 text-left text-sm hover:bg-gray-100 rounded"
            >
              <LuShare2 size={14} />
              <span>Share...</span>
            </button>
            
            <button
              onClick={handleTwitterShare}
              className="flex items-center w-full space-x-2 p-2 text-left text-sm hover:bg-gray-100 rounded"
            >
              <LuTwitter size={14} />
              <span>Twitter</span>
            </button>
            
            <button
              onClick={handleEmailShare}
              className="flex items-center w-full space-x-2 p-2 text-left text-sm hover:bg-gray-100 rounded"
            >
              <LuMail size={14} />
              <span>Email</span>
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleCopyLink}
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
      >
        {isCopied ? <LuCheck className="text-green-500" size={16} /> : <LuLink size={16} />}
        <span>{isCopied ? 'Copied!' : 'Copy link'}</span>
      </button>
      
      <button
        onClick={handleShare}
        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
      >
        <LuShare2 size={16} />
        <span>Share</span>
      </button>
      
      <button
        onClick={handleTwitterShare}
        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
      >
        <LuTwitter size={16} />
        <span>Twitter</span>
      </button>
      
      <button
        onClick={handleEmailShare}
        className="flex items-center space-x-1 px-3 py-1.5 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-800"
      >
        <LuMail size={16} />
        <span>Email</span>
      </button>
    </div>
  );
}
