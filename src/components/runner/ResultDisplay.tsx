'use client';

import React, { useState } from 'react';
import Button from '@/components/shared/Button';

interface FlowResult {
  stepId: string;
  stepTitle: string;
  promptId: string;
  promptTitle: string;
  model: string;
  output: string;
  imageUrl?: string;
  isActive: boolean;
  isComplete: boolean;
  isError: boolean;
  errorMessage?: string;
  hasImageCapability?: boolean;
}

interface ResultDisplayProps {
  result: FlowResult;
  stepNumber: number;
  onDownload: () => void;
  onViewPrompt?: (promptId: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  stepNumber,
  onDownload,
  onViewPrompt
}) => {
  const [isExpanded, setIsExpanded] = useState(result.isError);
  
  // If this step hasn't run yet, don't display anything
  if (!result.isComplete && !result.isError) {
    return null;
  }
  
  return (
    <div className={`border rounded-md overflow-hidden ${result.isError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div 
        className={`px-4 py-3 flex items-center justify-between cursor-pointer ${result.isError ? 'bg-red-100' : 'bg-gray-50'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className={`mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            result.isError ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
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
          <div>
            <h3 className="font-medium text-sm">
              Step {stepNumber}: {result.stepTitle}
            </h3>
            <div className="text-xs text-gray-500 flex items-center">
              <span>Using:</span>
              <span className="font-medium text-indigo-600 ml-1">{result.promptTitle}</span>
              <span className="ml-2 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{result.model}</span>
            </div>
          </div>
          {result.isError && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
              Error
            </span>
          )}
        </div>
        <div className="flex items-center">
          {onViewPrompt && (
            <button 
              onClick={(e) => { 
                e.stopPropagation();
                onViewPrompt(result.promptId);
              }}
              className="mr-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              View Prompt
            </button>
          )}
          <svg 
            className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
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
                    {result.hasImageCapability ? 'Image Description (for DALL-E)' : 'Text Output'}
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {result.output}
                  </div>
                </div>
              )}
              
              {/* Image output */}
              {result.imageUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                    DALL-E Generated Image
                  </h4>
                  <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                      {/* Display a fallback if image fails to load */}
                      <img
                        src={result.imageUrl}
                        alt={`Generated image for step ${stepNumber}`}
                        className="max-w-full max-h-96 object-contain"
                        onError={(e) => {
                          // Replace with error image
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMkYyRjIiLz48cGF0aCBkPSJNODYuODYxMyA5MS45MzMySDExMy4xMzlWMTIwSDg2Ljg2MTNWOTEuOTMzMlpNMTEzLjEzOSA4NS4zNzgxSDg2Ljg2MTNWODBIMTEzLjEzOVY4NS4zNzgxWiIgZmlsbD0iI0JEQkRCRCIvPjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    <div className="p-2 text-xs text-gray-500">
                      {result.hasImageCapability && result.output ? 
                        "Image created from the description above using DALL-E 3" : 
                        "Click to view full image"}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                {result.output && (
                  <Button
                    variant="outline"
                    onClick={onDownload}
                    className="text-sm"
                  >
                    Download Output
                  </Button>
                )}
                
                {result.imageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(result.imageUrl, '_blank')}
                    className="text-sm"
                  >
                    View Full Image
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
