"use client";

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { CreditCostDisplay } from './CreditBalance';

interface CreditConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  promptId: string;
  modelId: string;
  title: string;
}

export default function CreditConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  promptId,
  modelId,
  title,
}: CreditConfirmationDialogProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [costBreakdown, setCostBreakdown] = useState<{
    systemCost: number;
    creatorFee: number;
    platformFee: number;
    totalCost: number;
  } | null>(null);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  
  // Fetch user credits and calculate cost
  useEffect(() => {
    async function fetchData() {
      if (isOpen && session?.user?.id && promptId && modelId) {
        try {
          setLoading(true);
          
          // Get user's current credit balance
          const creditsResponse = await fetch('/api/credits/balance');
          if (!creditsResponse.ok) throw new Error('Failed to fetch credit balance');
          const creditsData = await creditsResponse.json();
          setUserCredits(creditsData.credits);
          
          // Calculate the cost of this prompt run
          const costResponse = await fetch('/api/credits/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptId, modelId }),
          });
          
          // If the calculate endpoint doesn't exist yet, use mock data
          if (!costResponse.ok) {
            // Mock cost breakdown based on model
            const mockCost = {
              systemCost: modelId.includes('image') ? 40000 : 20000,
              creatorFee: 5000,
              platformFee: 2500,
              totalCost: modelId.includes('image') ? 47500 : 27500,
            };
            setCostBreakdown(mockCost);
            setInsufficientFunds(creditsData.credits < mockCost.totalCost);
          } else {
            const costData = await costResponse.json();
            setCostBreakdown(costData);
            setInsufficientFunds(creditsData.credits < costData.totalCost);
          }
        } catch (error) {
          console.error('Error fetching credit data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [isOpen, session, promptId, modelId]);
  
  // Handle confirmation
  const handleConfirm = () => {
    if (!insufficientFunds && costBreakdown) {
      onConfirm();
    }
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white shadow-xl">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <Dialog.Title className="mt-3 text-lg font-medium">
                Confirm Credit Usage
              </Dialog.Title>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to run <span className="font-medium">{title}</span> with 
                    the following cost:
                  </p>
                  
                  {costBreakdown && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <CreditCostDisplay
                        systemCost={costBreakdown.systemCost}
                        creatorFee={costBreakdown.creatorFee}
                        platformFee={costBreakdown.platformFee}
                        totalCost={costBreakdown.totalCost}
                        showBreakdown={true}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Your balance:</span>
                    <span className="font-bold text-blue-800">
                      {userCredits.toLocaleString()} credits
                    </span>
                  </div>
                  
                  {insufficientFunds && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        You don't have enough credits to run this prompt.
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Purchase more credits to continue.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  
                  {insufficientFunds ? (
                    <Link 
                      href="/dashboard/credits"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Buy Credits
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      onClick={handleConfirm}
                    >
                      Confirm & Run
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

import Link from 'next/link';

// Flow Unlock Confirmation Dialog
interface FlowUnlockConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  flowId: string;
  flowTitle: string;
  unlockFee: number;
}

export function FlowUnlockConfirmation({
  isOpen,
  onClose,
  onUnlock,
  flowId,
  flowTitle,
  unlockFee,
}: FlowUnlockConfirmationProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate platform fee (20% of unlock fee)
  const platformFee = Math.floor(unlockFee * 0.2);
  const creatorPayment = unlockFee - platformFee;
  
  // Format dollar amount
  const dollarAmount = (unlockFee / 1000000).toFixed(6);
  
  // Fetch user credits
  useEffect(() => {
    async function fetchData() {
      if (isOpen && session?.user?.id) {
        try {
          setLoading(true);
          setError(null);
          
          // Get user's current credit balance
          const response = await fetch('/api/credits/balance');
          if (!response.ok) throw new Error('Failed to fetch credit balance');
          const data = await response.json();
          setUserCredits(data.credits);
          
          // Check if user has enough credits
          setInsufficientFunds(unlockFee > 0 && data.credits < unlockFee);
        } catch (err) {
          console.error('Error fetching user credits:', err);
          setError('Failed to load credit information');
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchData();
  }, [isOpen, session, unlockFee]);
  
  // Handle unlock
  const handleUnlock = async () => {
    if (insufficientFunds || !session?.user?.id) return;
    
    try {
      setUnlocking(true);
      setError(null);
      
      // Call API to unlock the flow
      const response = await fetch('/api/credits/unlock-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlock flow');
      }
      
      onUnlock();
      onClose();
    } catch (err: any) {
      console.error('Error unlocking flow:', err);
      setError(err.message || 'Failed to unlock flow. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };
  
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white shadow-xl">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <Dialog.Title className="mt-3 text-lg font-medium">
                Unlock Flow
              </Dialog.Title>
            </div>
            
            {loading ? (
              <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to unlock <span className="font-medium">{flowTitle}</span>.
                    This is a one-time payment that gives you permanent access to this flow.
                  </p>
                  
                  {unlockFee > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Unlock fee:</span>
                        <span className="font-medium">{unlockFee.toLocaleString()} credits</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Creator payment:</span>
                          <span>{creatorPayment.toLocaleString()} credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee:</span>
                          <span>{platformFee.toLocaleString()} credits</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-right">
                        ${dollarAmount} USD
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 text-center">
                      <p className="text-green-700 font-medium">This flow is free to unlock</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">Your balance:</span>
                    <span className="font-bold text-blue-800">
                      {userCredits.toLocaleString()} credits
                    </span>
                  </div>
                  
                  {insufficientFunds && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        You don't have enough credits to unlock this flow.
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Purchase more credits to continue.
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                    disabled={unlocking}
                  >
                    Cancel
                  </button>
                  
                  {insufficientFunds ? (
                    <Link
                      href="/dashboard/credits"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Buy Credits
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                      onClick={handleUnlock}
                      disabled={unlocking}
                    >
                      {unlocking ? 'Processing...' : unlockFee > 0 ? 'Unlock Flow' : 'Continue'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
