import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  itemId?: string;
  itemType?: 'prompt' | 'flow';
}

interface CreditState {
  credits: number;
  transactions: CreditTransaction[];
  
  // Actions
  addCredits: (amount: number, reason: string, itemId?: string) => void;
  deductCredits: (amount: number, reason: string, itemId?: string, itemType?: 'prompt' | 'flow') => void;
  setCredits: (amount: number) => void;
  
  // History
  getTransactions: () => CreditTransaction[];
  clearTransactions: () => void;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      credits: 5000, // Starting balance
      transactions: [],
      
      addCredits: (amount, reason, itemId) => {
        if (amount <= 0) return;
        
        set((state) => {
          const newTransaction: CreditTransaction = {
            id: crypto.randomUUID(),
            amount,
            reason,
            timestamp: Date.now(),
            itemId,
            itemType: undefined // Adding credits doesn't have an item type
          };
          
          return {
            credits: state.credits + amount,
            transactions: [newTransaction, ...state.transactions].slice(0, 100) // Keep last 100 transactions
          };
        });
      },
      
      deductCredits: (amount, reason, itemId, itemType) => {
        if (amount <= 0) return;
        
        set((state) => {
          // Check if we have enough credits
          if (state.credits < amount) {
            console.error('Insufficient credits');
            return state;
          }
          
          const newTransaction: CreditTransaction = {
            id: crypto.randomUUID(),
            amount: -amount, // Store as negative for deductions
            reason,
            timestamp: Date.now(),
            itemId,
            itemType
          };
          
          return {
            credits: state.credits - amount,
            transactions: [newTransaction, ...state.transactions].slice(0, 100) // Keep last 100 transactions
          };
        });
      },
      
      setCredits: (amount) => {
        set({ credits: amount });
      },
      
      getTransactions: () => {
        return get().transactions;
      },
      
      clearTransactions: () => {
        set({ transactions: [] });
      }
    }),
    {
      name: 'credit-storage',
    }
  )
);
