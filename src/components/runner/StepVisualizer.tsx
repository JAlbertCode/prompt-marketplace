'use client';

import React from 'react';

interface StepInfo {
  id: string;
  title: string;
  isActive: boolean;
  isComplete: boolean;
  isError: boolean;
}

interface StepVisualizerProps {
  steps: StepInfo[];
}

const StepVisualizer: React.FC<StepVisualizerProps> = ({ steps }) => {
  return (
    <div className="pb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Flow Progress</h3>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
              </div>
              <span className="text-xs text-gray-600 mt-1 max-w-[80px] truncate text-center">
                {step.title}
              </span>
              
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
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 bg-gray-200 relative">
                {(step.isComplete || step.isError) && (
                  <div 
                    className={`absolute inset-0 ${
                      step.isError ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  ></div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepVisualizer;
