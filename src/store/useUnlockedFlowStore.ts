import { create } from 'zustand';

interface UnlockedFlowState {
  // The list of flow IDs that the user has unlocked
  unlockedFlows: string[];
  
  // Check if a flow is unlocked
  isFlowUnlocked: (flowId: string) => boolean;
  
  // Unlock a flow
  unlockFlow: (flowId: string) => void;
  
  // Set the initial unlocked flows list (e.g., from the server)
  setUnlockedFlows: (flowIds: string[]) => void;
}

export const useUnlockedFlowStore = create<UnlockedFlowState>(
  (set, get) => ({
    unlockedFlows: [],
    
    isFlowUnlocked: (flowId: string) => {
      return get().unlockedFlows.includes(flowId);
    },
    
    unlockFlow: (flowId: string) => {
      // Only add the flow if it's not already unlocked
      if (!get().isFlowUnlocked(flowId)) {
        set((state) => ({
          unlockedFlows: [...state.unlockedFlows, flowId],
        }));
      }
    },
    
    setUnlockedFlows: (flowIds: string[]) => {
      set({ unlockedFlows: flowIds });
    },
  })
);
