'use client';

import React from 'react';
import Link from 'next/link';

interface StepInfo {
  id: string;
  title: string;
  promptId: string;
  promptTitle: string;
  model: string;
  isActive: boolean;
  isComplete: boolean;
  isError: boolean;
}

interface StepVisualizerProps {
  steps: StepInfo[];
  onViewPrompt?: (promptId: string) => void;
  onFavoritePrompt?: (promptId: string) => void;
}

const StepVisualizer: React.FC<StepVisualizerProps> = ({ 
  steps, 
  onViewPrompt,
  onFavoritePrompt 
}) => {
  return (
    <div className="pb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Flow Progress</h3>
      
      <div className="relative pb-8">
        {/* Vertical Timeline Line */}
        <div className="absolute left-9 top-0 h-full w-0.5 bg-gray-200"></div>
        
        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start">
              {/* Step Number Circle */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                  step.isError
                    ? 'bg-red-100 border-2 border-red-500 text-red-700'
                    : step.isComplete
                      ? 'bg-green-100 border-2 border-green-500 text-green-700'
                      : step.isActive
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                }`}
              >
                {step.isError ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : step.isComplete ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
                
                {/* Loading spinner for active step */}
                {step.isActive && !step.isComplete && !step.isError && (
                  <div className="absolute -top-1 -right-1 w-5 h-5">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Step Details */}
              <div className="ml-4 bg-white border border-gray-200 rounded-lg shadow-sm p-3 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-gray-500">Using prompt:</span>
                      <span className="ml-1 text-xs font-medium text-indigo-600">{step.promptTitle}</span>
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{step.model}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {onViewPrompt && (
                      <button 
                        onClick={() => onViewPrompt(step.promptId)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Prompt
                      </button>
                    )}
                    
                    {onFavoritePrompt && (
                      <button 
                        onClick={() => onFavoritePrompt(step.promptId)}
                        className="text-xs text-gray-500 hover:text-yellow-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="mt-2">
                  {step.isError ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 rounded px-2 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Failed
                    </span>
                  ) : step.isComplete ? (
                    <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 rounded px-2 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Complete
                    </span>
                  ) : step.isActive ? (
                    <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 rounded px-2 py-1">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-50 rounded px-2 py-1">
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepVisualizer;
