'use client';

import React, { useState, useEffect } from 'react';
import { useCreditStore } from '@/store/useCreditStore';
import Link from 'next/link';

const LOW_CREDIT_THRESHOLD = 5000; // Show alert when credits drop below 5,000

interface LowCreditAlertProps {
  className?: string;
}

const LowCreditAlert: React.FC<LowCreditAlertProps> = ({ className = '' }) => {
  const { credits, fetchCredits } = useCreditStore();
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Get dismissed state from local storage
    const dismissedUntil = localStorage.getItem('lowCreditAlertDismissedUntil');
    if (dismissedUntil) {
      const dismissedTime = parseInt(dismissedUntil, 10);
      if (Date.now() < dismissedTime) {
        setDismissed(true);
      } else {
        // Clear expired dismissal
        localStorage.removeItem('lowCreditAlertDismissedUntil');
      }
    }
    
    // Fetch latest credit balance
    fetchCredits();
  }, [fetchCredits]);
  
  // Dismiss the alert for 24 hours
  const handleDismiss = () => {
    const dismissUntil = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    localStorage.setItem('lowCreditAlertDismissedUntil', dismissUntil.toString());
    setDismissed(true);
  };
  
  // If credits are above threshold or alert is dismissed, don't show anything
  if (credits > LOW_CREDIT_THRESHOLD || dismissed) {
    return null;
  }
  
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-md p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">Low Credit Balance</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              You have {credits.toLocaleString()} credits remaining. Consider purchasing more credits to ensure uninterrupted usage.
            </p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Link
              href="/credits/purchase"
              className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
            >
              Buy Credits
            </Link>
            
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm ring-1 ring-inset ring-amber-600 hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowCreditAlert;