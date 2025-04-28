import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOrCreateSessionId, isValidSession } from '@/lib/sessionHelpers';
import { getCreditWarningLevel } from '@/lib/creditHelpers';

interface CreditTransaction {
  id: string;
  timestamp: number;
  amount: number;
  type: 'deduct' | 'add';
  reason: string;
  promptId?: string;
}

interface CreditState {
  credits: number;
  sessionId: string;
  transactions: CreditTransaction[];
  warningLevel: 'none' | 'low' | 'critical';
  autoTopUp: boolean;
  autoTopUpThreshold: number;
  autoTopUpAmount: number;
  deductCredits: (amount: number, reason: string, promptId?: string) => boolean;
  addCredits: (amount: number, reason: string) => void;
  resetCredits: () => void;
  setAutoTopUp: (enabled: boolean) => void;
  setAutoTopUpSettings: (threshold: number, amount: number) => void;
  updateWarningLevel: () => void;
}

const INITIAL_CREDITS = 1000;
const DEFAULT_AUTO_TOPUP_THRESHOLD = 200;
const DEFAULT_AUTO_TOPUP_AMOUNT = 1000;

const generateTransactionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      credits: INITIAL_CREDITS,
      sessionId: '',
      transactions: [],
      warningLevel: 'none',
      autoTopUp: false,
      autoTopUpThreshold: DEFAULT_AUTO_TOPUP_THRESHOLD,
      autoTopUpAmount: DEFAULT_AUTO_TOPUP_AMOUNT,
      
      deductCredits: (amount: number, reason: string = "Credit deduction", promptId?: string) => {
        const currentCredits = get().credits;
        
        // Check if user has enough credits
        if (currentCredits < amount) {
          // Not enough credits - return false to indicate failure
          return false;
        }
        
        // Create a transaction record
        const transaction: CreditTransaction = {
          id: generateTransactionId(),
          timestamp: Date.now(),
          amount,
          type: 'deduct',
          reason,
          promptId
        };
        
        // Update credits and transaction history
        set((state) => {
          const newCredits = Math.max(0, state.credits - amount);
          const warningLevel = getCreditWarningLevel(newCredits);
          
          return { 
            credits: newCredits,
            transactions: [transaction, ...state.transactions].slice(0, 50), // Keep last 50 transactions
            warningLevel
          };
        });
        
        // Check if auto top-up should be triggered
        const { autoTopUp, autoTopUpThreshold, autoTopUpAmount } = get();
        const newCredits = get().credits;
        
        if (autoTopUp && newCredits <= autoTopUpThreshold) {
          // Auto top-up (in a real app, this would trigger a payment)
          // For this MVP, we'll just add the credits directly
          get().addCredits(autoTopUpAmount, 'Auto top-up');
        }
        
        return true;
      },
      
      addCredits: (amount: number, reason: string = "Credit addition") => {
        // Create a transaction record
        const transaction: CreditTransaction = {
          id: generateTransactionId(),
          timestamp: Date.now(),
          amount,
          type: 'add',
          reason
        };
        
        // Update credits and transaction history
        set((state) => ({ 
          credits: state.credits + amount,
          transactions: [transaction, ...state.transactions].slice(0, 50), // Keep last 50 transactions
          warningLevel: getCreditWarningLevel(state.credits + amount)
        }));
      },
      
      resetCredits: () => 
        set({ 
          credits: INITIAL_CREDITS,
          transactions: [],
          warningLevel: 'none'
        }),
        
      setAutoTopUp: (enabled: boolean) =>
        set({ autoTopUp: enabled }),
        
      setAutoTopUpSettings: (threshold: number, amount: number) =>
        set({ 
          autoTopUpThreshold: threshold,
          autoTopUpAmount: amount
        }),
        
      updateWarningLevel: () => {
        const credits = get().credits;
        set({ warningLevel: getCreditWarningLevel(credits) });
      }
    }),
    {
      name: 'credit-storage',
      onRehydrateStorage: () => {
        // When rehydrating storage, update the session ID
        return (state) => {
          if (state) {
            state.sessionId = getOrCreateSessionId();
            state.updateWarningLevel();
            
            // If session validation fails, reset to initial state
            // This prevents credit refresh exploits
            if (!isValidSession()) {
              state.credits = INITIAL_CREDITS;
              state.transactions = [];
              state.warningLevel = 'none';
            }
          }
        };
      }
    }
  )
);
