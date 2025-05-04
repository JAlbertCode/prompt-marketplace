'use client';

import React, { useState, useEffect } from 'react';
import { useCredits } from '@/providers/CreditProvider';
import CreditConfirmationModal from '@/components/ui/CreditConfirmationModal';
import CostDisplay from '@/components/credits/CostDisplay';
import { toast } from 'react-hot-toast';

interface PromptRunnerProps {
  promptId: string;
  modelId: string;
  inputs: Record<string, any>;
  onRun: () => Promise<any>;
  onResult: (result: any) => void;
  isLoading?: boolean;
  showCreditDetails?: boolean;
}

export default function PromptRunner({
  promptId,
  modelId,
  inputs,
  onRun,
  onResult,
  isLoading = false,
  showCreditDetails = true,
}: PromptRunnerProps) {
  const { credits, calculatePromptCost, chargeForPromptRun } = useCredits();
  const [costBreakdown, setCostBreakdown] = useState<{
    inferenceCost: number;
    creatorFee: number;
    platformMarkup: number;
    totalCost: number;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    // Calculate cost when prompt or model changes
    const fetchCost = async () => {
      try {
        const cost = await calculatePromptCost(promptId, modelId);
        setCostBreakdown(cost);
      } catch (error) {
        console.error('Error fetching cost:', error);
        toast.error('Failed to calculate prompt cost');
      }
    };
    
    fetchCost();
  }, [promptId, modelId, calculatePromptCost]);

  const handleRunClick = () => {
    if (!costBreakdown) {
      toast.error('Cost calculation is not complete');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRun = async () => {
    try {
      setIsRunning(true);
      
      // Charge the user for the prompt run
      const success = await chargeForPromptRun(promptId, modelId);
      
      if (!success) {
        toast.error('Failed to charge credits for this prompt run');
        setIsConfirmModalOpen(false);
        setIsRunning(false);
        return;
      }
      
      // Execute the prompt
      const result = await onRun();
      
      // Handle the result
      onResult(result);
      
      toast.success('Prompt executed successfully');
    } catch (error) {
      console.error('Error running prompt:', error);
      toast.error('Failed to run the prompt');
    } finally {
      setIsConfirmModalOpen(false);
      setIsRunning(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Cost Display */}
      {showCreditDetails && costBreakdown && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Cost to Run</h3>
          <CostDisplay 
            breakdown={costBreakdown}
            showBreakdown={false}
            compact={true}
          />
        </div>
      )}
      
      {/* Run Button */}
      <button
        onClick={handleRunClick}
        disabled={isLoading || isRunning || !costBreakdown}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning || isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : costBreakdown ? (
          `Run Prompt (${costBreakdown.totalCost.toLocaleString()} credits)`
        ) : (
          'Calculating cost...'
        )}
      </button>
      
      {/* Credit Confirmation Modal */}
      {costBreakdown && (
        <CreditConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRun}
          title="Confirm Credit Charge"
          description="You will be charged the following credits to run this prompt:"
          cost={costBreakdown}
          userBalance={credits}
          isLoading={isRunning}
        />
      )}
    </div>
  );
}
