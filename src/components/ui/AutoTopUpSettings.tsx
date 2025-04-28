'use client';

import { useState } from 'react';
import { useCreditStore } from '@/store/useCreditStore';
import { formatCredits } from '@/lib/creditHelpers';
import { LuWallet, LuBell, LuSettings } from 'react-icons/lu';

interface AutoTopUpSettingsProps {
  compact?: boolean;
}

export default function AutoTopUpSettings({ compact = false }: AutoTopUpSettingsProps) {
  const { 
    autoTopUp, 
    autoTopUpThreshold, 
    autoTopUpAmount, 
    setAutoTopUp, 
    setAutoTopUpSettings 
  } = useCreditStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [localThreshold, setLocalThreshold] = useState(autoTopUpThreshold);
  const [localAmount, setLocalAmount] = useState(autoTopUpAmount);
  
  const handleSave = () => {
    // Only save if values are valid
    if (localThreshold > 0 && localAmount > 0) {
      setAutoTopUpSettings(localThreshold, localAmount);
      setIsOpen(false);
    }
  };
  
  if (compact) {
    return (
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm flex items-center space-x-1 text-gray-600 hover:text-gray-900"
          aria-label="Auto Top-Up Settings"
        >
          <LuSettings size={14} />
          <span>Auto Top-Up {autoTopUp ? 'On' : 'Off'}</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-20 mt-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-64">
            <h3 className="font-medium mb-3">Auto Top-Up Settings</h3>
            
            <div className="mb-3">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  checked={autoTopUp}
                  onChange={(e) => setAutoTopUp(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>Enable Auto Top-Up</span>
              </label>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Threshold
              </label>
              <div className="flex items-center">
                <input 
                  type="number"
                  min="1"
                  value={localThreshold}
                  onChange={(e) => setLocalThreshold(parseInt(e.target.value) || 0)}
                  className="form-input w-full text-sm p-2 border border-gray-300 rounded"
                />
                <span className="ml-1 text-sm">credits</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto top-up when credits fall below this amount
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm mb-1">
                Add Amount
              </label>
              <div className="flex items-center">
                <input 
                  type="number"
                  min="1000"
                  step="1000"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(parseInt(e.target.value) || 0)}
                  className="form-input w-full text-sm p-2 border border-gray-300 rounded"
                />
                <span className="ml-1 text-sm">credits</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How many credits to add each time
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={localThreshold <= 0 || localAmount <= 0}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <LuWallet className="mr-2" />
          Auto Top-Up Settings
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox"
            checked={autoTopUp}
            onChange={(e) => setAutoTopUp(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auto Top-Up Threshold
          </label>
          <div className="flex items-center">
            <input 
              type="number"
              min="1"
              value={localThreshold}
              onChange={(e) => setLocalThreshold(parseInt(e.target.value) || 0)}
              className="form-input block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={!autoTopUp}
            />
            <span className="ml-2 text-sm text-gray-500">credits</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <LuBell className="mr-1" size={12} />
            Auto top-up will trigger when your balance falls below this amount
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auto Top-Up Amount
          </label>
          <div className="flex items-center">
            <input 
              type="number"
              min="1000"
              step="1000"
              value={localAmount}
              onChange={(e) => setLocalAmount(parseInt(e.target.value) || 0)}
              className="form-input block w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={!autoTopUp}
            />
            <span className="ml-2 text-sm text-gray-500">credits</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            How many credits to add each time auto top-up is triggered
          </p>
        </div>
        
        <div className="pt-3">
          <button 
            onClick={handleSave}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={!autoTopUp || localThreshold <= 0 || localAmount <= 0}
          >
            Save Settings
          </button>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-md">
        <div className="font-medium mb-1">Perfect for Automation</div>
        <p>
          Auto Top-Up ensures your automated workflows never run out of credits.
          Recommended for webhook integrations.
        </p>
      </div>
    </div>
  );
}
