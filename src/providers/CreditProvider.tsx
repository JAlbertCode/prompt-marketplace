'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { getUserCredits, deductCredits, calculatePromptRunCost } from '@/utils/clientCreditManager';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

// This is a simplified mock of authentication
// In a real app, this would come from your auth context/provider
const getCurrentUserId = () => {
  // Return a default user ID for now
  // In production, this would come from the auth system
  return 'user_default';
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
  const { data: session, status } = useSession();

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only fetch credits if we have an authenticated session
      if (status === 'authenticated' && session?.user?.id) {
        const userId = session.user.id;
        const userCredits = await getUserCredits(userId);
        setCredits(userCredits);
      } else if (status === 'loading') {
        // Do nothing while session is loading
        return;
      } else {
        // Session not authenticated or user ID not available
        setCredits(0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast.error('Failed to load your credit balance');
      setCredits(0); // Reset to 0 on error
    } finally {
      setLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    // Initialize credits on mount
    fetchCredits();
    
    // Set up refresh interval for credits (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchCredits();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
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
      // Only charge if we have an authenticated session
      if (status !== 'authenticated' || !session?.user?.id) {
        toast.error('You must be logged in to run prompts');
        return false;
      }
      
      const userId = session.user.id;
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
  }, [hasEnoughCredits, status, session]);

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
