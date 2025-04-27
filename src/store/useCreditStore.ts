import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditState {
  credits: number;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
  resetCredits: () => void;
}

const INITIAL_CREDITS = 1000;

export const useCreditStore = create<CreditState>()(
  persist(
    (set) => ({
      credits: INITIAL_CREDITS,
      deductCredits: (amount: number) => 
        set((state) => ({ 
          credits: Math.max(0, state.credits - amount) 
        })),
      addCredits: (amount: number) => 
        set((state) => ({ 
          credits: state.credits + amount 
        })),
      resetCredits: () => 
        set({ 
          credits: INITIAL_CREDITS 
        }),
    }),
    {
      name: 'credit-storage',
    }
  )
);
