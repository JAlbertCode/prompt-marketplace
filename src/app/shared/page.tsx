'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LuChevronLeft, LuDownload, LuShare2, LuCopy } from 'react-icons/lu';
import { parseSharedResponse } from '@/lib/shareHelpers';
import { usePromptStore } from '@/store/usePromptStore';
import ShareButtons from '@/components/ui/ShareButtons';
import { downloadOutput } from '@/lib/downloadHelpers';
import { copyToClipboard } from '@/lib/shareHelpers';
import { toast } from 'react-hot-toast';

export default function SharedResponsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sharedData, setSharedData] = useState<{
    promptId: string;
    promptTitle: string;
    response: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptDetails, setPromptDetails] = useState<any>(null);
  const { getPrompt } = usePromptStore();
  
  useEffect(() => {
    if (searchParams) {
      const data = parseSharedResponse(searchParams);
      setSharedData(data);
      setLoading(false);
      
      // Try to get prompt details if available
      if (data?.promptId && getPrompt) {
        const prompt = getPrompt(data.promptId);
        if (prompt) {
          setPromptDetails(prompt);
        }
      }
    }
  }, [searchParams, getPrompt]);
  
  const handleCopyResponse = async () => {
    if (sharedData?.response) {
      const success = await copyToClipboard(sharedData.response);
      if (success) {
        toast.success('Response copied to clipboard');
      } else {
        toast.error('Failed to copy response');
      }
    }
  };
  
  const handleDownload = () => {
    if (sharedData?.response) {
      downloadOutput(sharedData.response, `${sharedData.promptTitle.replace(/\s+/g, '-').toLowerCase()}-response.txt`);
      toast.success('Response downloaded');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!sharedData) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Shared Response</h1>
        <p className="text-gray-600 mb-6">
          The shared response link is invalid or has expired.
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
              {sharedData.promptTitle}
            </h1>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCopyResponse}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Copy to clipboard"
              >
                <LuCopy size={18} />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Download response"
              >
                <LuDownload size={18} />
              </button>
              
              <ShareButtons
                promptId={sharedData.promptId}
                promptTitle={sharedData.promptTitle}
                response={sharedData.response}
                compact
              />
            </div>
          </div>
          
          {promptDetails && (
            <p className="text-sm text-gray-600 mt-1">
              {promptDetails.description}
            </p>
          )}
        </div>
        
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200">
              {sharedData.response}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Shared from PromptFlow Marketplace
            </div>
            
            <Link href={`/run/${sharedData.promptId}`}>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                Try This Prompt
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
