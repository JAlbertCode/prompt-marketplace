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
  warningLevel?: 'none' | 'low' | 'critical';
  
  // Actions
  fetchCredits: () => Promise<void>;
  addCredits: (amount: number, source: string) => Promise<void>;
  deductCredits: (amount: number, reason: string, itemId?: string, itemType?: string) => Promise<boolean>;
  setCredits: (credits: number) => void;
  setCreditBreakdown: (breakdown: CreditBreakdown) => void;
  clearError: () => void;
}

export const useCreditStore = create<CreditStore>(
  (set, get) => ({
    credits: 0,
    isLoading: false,
    error: null,
    creditBreakdown: {
      purchased: 0,
      bonus: 0,
      referral: 0
    },
    recentTransactions: [],
    warningLevel: 'none',
      
    fetchCredits: async () => {
      try {
        set({ isLoading: true, error: null });
        
        console.log('Fetching credits from balance API...');
        const response = await fetch(`/api/credits/balance?_t=${Date.now()}`, {
          credentials: 'include',
        });
        
        console.log('Credit balance API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Credit balance API error:', response.status, errorData);
          throw new Error(errorData.error || `Failed to fetch credits: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Credit balance data received:', data);
        
        // Calculate warning level
        let warningLevel: 'none' | 'low' | 'critical' = 'none';
        if (data.totalCredits < 100) {
          warningLevel = 'critical';
        } else if (data.totalCredits < 5000) {
          warningLevel = 'low';
        }
        
        set({
          credits: data.totalCredits,
          creditBreakdown: data.creditBreakdown,
          warningLevel,
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
        
        const newTotal = get().credits + amount;
        
        // Recalculate warning level
        let warningLevel: 'none' | 'low' | 'critical' = 'none';
        if (newTotal < 100) {
          warningLevel = 'critical';
        } else if (newTotal < 5000) {
          warningLevel = 'low';
        }
        
        set({
          credits: newTotal,
          warningLevel,
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
        
        // Call the API to deduct credits
        const response = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            modelId: 'gpt-4o',
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
        
        const newTotal = Math.max(0, get().credits - amount);
        
        // Recalculate warning level
        let warningLevel: 'none' | 'low' | 'critical' = 'none';
        if (newTotal < 100) {
          warningLevel = 'critical';
        } else if (newTotal < 5000) {
          warningLevel = 'low';
        }
        
        set({
          credits: newTotal,
          warningLevel,
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
      // Calculate warning level
      let warningLevel: 'none' | 'low' | 'critical' = 'none';
      if (credits < 100) {
        warningLevel = 'critical';
      } else if (credits < 5000) {
        warningLevel = 'low';
      }
      
      set({ credits, warningLevel });
    },
    
    setCreditBreakdown: (breakdown: CreditBreakdown) => {
      set({ creditBreakdown: breakdown });
    },
    
    clearError: () => {
      set({ error: null });
    }
  })
);