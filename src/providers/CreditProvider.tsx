'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getUserCredits, deductCredits, calculatePromptRunCost } from '@/utils/creditManager';
import { toast } from 'react-hot-toast';

// This is a simplified mock of authentication
// In a real app, this would come from your auth context/provider
const getCurrentUserId = () => {
  // This is just a placeholder - in a real app, get the actual user ID from auth
  return 'user_123';
};

interface CreditContextType {
  credits: number;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  chargeForPromptRun: (promptId: string, modelId: string) => Promise<boolean>;
  hasEnoughCredits: (amount: number) => boolean;
  calculatePromptCost: (promptId: string, modelId: string) => Promise<{
    inferenceCost: number;
    creatorFee: number;
    platformMarkup: number;
    totalCost: number;
  }>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      if (!userId) return;
      
      const userCredits = await getUserCredits(userId);
      setCredits(userCredits);
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Failed to load your credit balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const hasEnoughCredits = useCallback((amount: number): boolean => {
    return credits >= amount;
  }, [credits]);

  const calculatePromptCost = useCallback(async (promptId: string, modelId: string) => {
    try {
      const cost = await calculatePromptRunCost(promptId, modelId);
      return cost;
    } catch (error) {
      console.error('Error calculating prompt cost:', error);
      toast.error('Failed to calculate prompt cost');
      // Return default values in case of error
      return {
        inferenceCost: 0,
        creatorFee: 0,
        platformMarkup: 0,
        totalCost: 0,
      };
    }
  }, []);

  const chargeForPromptRun = useCallback(async (promptId: string, modelId: string): Promise<boolean> => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return false;
      
      const { totalCost } = await calculatePromptRunCost(promptId, modelId);
      
      if (!hasEnoughCredits(totalCost)) {
        toast.error('Not enough credits to run this prompt');
        return false;
      }
      
      const description = `Prompt run: ${promptId} using model: ${modelId}`;
      const newBalance = await deductCredits(userId, totalCost, description, 'PROMPT_RUN');
      
      if (newBalance === null) {
        toast.error('Failed to charge credits');
        return false;
      }
      
      // Update the local credit state
      setCredits(newBalance);
      return true;
    } catch (error) {
      console.error('Error charging for prompt run:', error);
      toast.error('Failed to process the transaction');
      return false;
    }
  }, [hasEnoughCredits]);

  const value = {
    credits,
    loading,
    refreshCredits: fetchCredits,
    chargeForPromptRun,
    hasEnoughCredits,
    calculatePromptCost,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
