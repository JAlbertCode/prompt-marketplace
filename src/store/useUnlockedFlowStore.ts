import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UnlockedFlowState {
  unlockedFlowIds: string[];
  unlockFlow: (flowId: string) => void;
  isFlowUnlocked: (flowId: string) => boolean;
  resetStore: () => void;
}

export const useUnlockedFlowStore = create<UnlockedFlowState>()(
  persist(
    (set, get) => ({
      unlockedFlowIds: ['flow-1'], // Start with sample flow unlocked
      
      unlockFlow: (flowId: string) => {
        const currentUnlocked = get().unlockedFlowIds;
        
        // Don't add duplicates
        if (currentUnlocked.includes(flowId)) {
          return;
        }
        
        set((state) => ({
          unlockedFlowIds: [...state.unlockedFlowIds, flowId]
        }));
      },
      
      isFlowUnlocked: (flowId: string) => {
        return get().unlockedFlowIds.includes(flowId);
      },
      
      resetStore: () => {
        set({ unlockedFlowIds: ['flow-1'] });
      }
    }),
    {
      name: 'unlocked-flows-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : null)
    }
  )
);
