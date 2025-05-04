'use client';

import React from 'react';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

interface CreditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  cost: {
    inferenceCost: number;
    platformMarkup: number;
    creatorFee: number;
    totalCost: number;
  };
  userBalance: number;
  isLoading?: boolean;
}

export default function CreditConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  cost,
  userBalance,
  isLoading = false,
}: CreditConfirmationModalProps) {
  if (!isOpen) return null;

  const { inferenceCost, platformMarkup, creatorFee, totalCost } = cost;
  const hasEnoughCredits = userBalance >= totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-fadeIn">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>

        <div className="bg-gray-50 rounded-md p-4 mb-4">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Base inference cost:</span>
              <span>{inferenceCost.toLocaleString()} credits</span>
            </div>
            
            {platformMarkup > 0 && (
              <div className="flex justify-between">
                <span>Platform markup:</span>
                <span>{platformMarkup.toLocaleString()} credits</span>
              </div>
            )}
            
            {creatorFee > 0 && (
              <div className="flex justify-between">
                <span>Creator fee:</span>
                <span>{creatorFee.toLocaleString()} credits</span>
              </div>
            )}
            
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
              <span>Total cost:</span>
              <span>{totalCost.toLocaleString()} credits</span>
            </div>
            
            <div className="text-xs text-gray-500 pt-1">
              <span>≈ {formatCreditsToDollars(totalCost)}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Your balance:</span>
            <span 
              className={hasEnoughCredits ? 'text-green-600' : 'text-red-600'}
            >
              {userBalance.toLocaleString()} credits
            </span>
          </div>
          
          {!hasEnoughCredits && (
            <div className="text-red-600 text-sm mt-2">
              You don't have enough credits. Please purchase more credits to continue.
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
            disabled={!hasEnoughCredits || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Confirm and spend ${totalCost.toLocaleString()} credits`
            )}
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          {creatorFee > 0 ? (
            <p>{Math.floor(creatorFee * 0.8).toLocaleString()} credits will go to the creator (80% of creator fee).</p>
          ) : (
            <p>Platform markup is applied since no creator fee is set.</p>
          )}
        </div>
      </div>
    </div>
  );
}
