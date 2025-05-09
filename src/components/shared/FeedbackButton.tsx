'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface FeedbackButtonProps {
  type: 'feature' | 'bug';
  className?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  type, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getUrl = () => {
    const baseUrl = 'https://github.com/your-username/prompt-marketplace/issues/new';
    
    if (type === 'feature') {
      return `${baseUrl}?template=feature_request.md`;
    } else {
      return `${baseUrl}?template=bug_report.md`;
    }
  };
  
  const handleClick = () => {
    window.open(getUrl(), '_blank');
    toast.success(`Opening ${type === 'feature' ? 'feature request' : 'bug report'} form on GitHub`);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md 
        ${type === 'feature' 
          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
          : 'bg-red-50 text-red-600 hover:bg-red-100'
        } ${className}`}
    >
      {type === 'feature' ? (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === 'feature' ? 'Request Feature' : 'Report Bug'}
    </button>
  );
};

export default FeedbackButton;
