import { create } from 'zustand';
import { PromptLength } from '@/lib/models/modelRegistry';

interface CreditTransaction {
  id: string;
  userId: string;
  creatorId?: string;
  modelId: string;
  creditsUsed: number;
  creatorFeePercentage: number;
  promptLength: PromptLength;
  createdAt: Date;
  itemType?: 'prompt' | 'flow' | 'completion';
  itemId?: string;
}

interface CreditBreakdown {
  purchased: number;
  bonus: number;
  referral: number;
}

interface CreditStore {
  // State
  credits: number;
  isLoading: boolean;
  error: string | null;
  creditBreakdown: CreditBreakdown;
  recentTransactions: CreditTransaction[];
  
  // Actions
  fetchCredits: () => Promise<void>;
  addCredits: (amount: number, source: string) => Promise<void>;
  deductCredits: (amount: number, reason: string, itemId?: string, itemType?: string) => Promise<boolean>;
  setCredits: (credits: number) => void;
  setCreditBreakdown: (breakdown: CreditBreakdown) => void;
  clearError: () => void;
}

export const useCreditStore = create<CreditStore>((set, get) => ({
  credits: 0,
  isLoading: false,
  error: null,
  creditBreakdown: {
    purchased: 0,
    bonus: 0,
    referral: 0
  },
  recentTransactions: [],
  
  fetchCredits: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/credits');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch credits');
      }
      
      const data = await response.json();
      
      set({
        credits: data.totalCredits,
        creditBreakdown: data.creditBreakdown,
        recentTransactions: data.recentTransactions,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching credits:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch credits',
        isLoading: false
      });
    }
  },
  
  addCredits: async (amount: number, source: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          source
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add credits');
      }
      
      const data = await response.json();
      
      set({
        credits: data.total,
        isLoading: false
      });
      
      // Refresh all credit data
      get().fetchCredits();
      
      return data;
    } catch (error) {
      console.error('Error adding credits:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add credits',
        isLoading: false
      });
    }
  },
  
  deductCredits: async (amount: number, reason: string, itemId?: string, itemType?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // For this dummy function, we'll just assume it's working using a generic model
      // In real implementation, you'd need to call the API with full model details
      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelId: 'gpt-4o', // Placeholder model
          promptLength: 'medium',
          itemType,
          itemId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to deduct credits');
      }
      
      const data = await response.json();
      
      set({
        credits: data.remaining,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to deduct credits',
        isLoading: false
      });
      return false;
    }
  },
  
  setCredits: (credits: number) => {
    set({ credits });
  },
  
  setCreditBreakdown: (breakdown: CreditBreakdown) => {
    set({ creditBreakdown: breakdown });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));