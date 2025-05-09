import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'gray' | 'white';
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue' 
}: LoadingSpinnerProps) {
  // Determine size class
  let sizeClass;
  switch (size) {
    case 'sm':
      sizeClass = 'h-4 w-4 border-2';
      break;
    case 'lg':
      sizeClass = 'h-10 w-10 border-4';
      break;
    case 'md':
    default:
      sizeClass = 'h-6 w-6 border-3';
      break;
  }
  
  // Determine color class
  let colorClass;
  switch (color) {
    case 'white':
      colorClass = 'border-white border-t-transparent';
      break;
    case 'gray':
      colorClass = 'border-gray-300 border-t-gray-600';
      break;
    case 'blue':
    default:
      colorClass = 'border-blue-300 border-t-blue-600';
      break;
  }
  
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClass} ${colorClass} rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      ></div>
    </div>
  );
}
