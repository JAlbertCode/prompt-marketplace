'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/shared/Button';

interface FlowResult {
  stepId: string;
  stepTitle: string;
  promptId: string;
  output: string;
  imageUrl?: string;
  isActive: boolean;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
}

interface ResultDisplayProps {
  result: FlowResult;
  stepNumber: number;
  onDownload: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  stepNumber,
  onDownload
}) => {
  const [isExpanded, setIsExpanded] = useState(result.isError);
  
  // If this step hasn't run yet, don't display anything
  if (!result.isComplete && !result.isError) {
    return null;
  }
  
  return (
    <div className={`border rounded-md overflow-hidden ${
      result.isError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
    }`}>
      <div 
        className={`px-4 py-3 flex items-center justify-between cursor-pointer ${
          result.isError ? 'bg-red-100' : 'bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            result.isError 
              ? 'bg-red-200 text-red-700' 
              : 'bg-green-200 text-green-700'
          }`}>
            {result.isError ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h3 className="font-medium text-sm">
            Step {stepNumber}: {result.stepTitle}
          </h3>
          {result.isError && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Error
            </span>
          )}
        </div>
        <svg 
          className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {result.isError ? (
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">Error:</p>
              <p>{result.errorMessage || 'An unknown error occurred during execution'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Text output */}
              {result.output && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Text Output
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap">
                    {result.output}
                  </div>
                </div>
              )}
              
              {/* Image output */}
              {result.imageUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    Image Output
                  </h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="relative aspect-[16/9] bg-gray-100">
                      <img
                        src={result.imageUrl}
                        alt={`Generated image for step ${stepNumber}`}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              {result.output && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={onDownload}
                    className="text-sm"
                  >
                    Download Output
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
