'use client';

import React from 'react';
import { useCreditStore } from '@/store/useCreditStore';

const CreditHeader: React.FC = () => {
  const { credits, warningLevel } = useCreditStore();
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 py-2 px-4 mb-6 rounded-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Available Credits</h3>
            <div className={`text-xl font-bold ${
              warningLevel === 'critical' ? 'text-red-600' :
              warningLevel === 'low' ? 'text-amber-600' :
              'text-green-600'
            }`}>
              {credits.toLocaleString()}
            </div>
          </div>
        </div>
        
        {warningLevel !== 'none' && (
          <div className={`px-3 py-1 rounded-md text-sm ${
            warningLevel === 'critical' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {warningLevel === 'critical' 
              ? 'Critical: Low Credits' 
              : 'Warning: Credits Running Low'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHeader;
