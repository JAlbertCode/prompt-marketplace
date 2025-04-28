import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOrCreateSessionId, isValidSession } from '@/lib/sessionHelpers';

interface UnlockedPrompt {
  promptId: string;
  unlockedAt: number;
}

interface UnlockedPromptState {
  unlockedPrompts: UnlockedPrompt[];
  sessionId: string;
  hasUnlockedPrompt: (promptId: string) => boolean;
  unlockPrompt: (promptId: string) => void;
  getUnlockedPrompts: () => string[];
}

export const useUnlockedPromptStore = create<UnlockedPromptState>()(
  persist(
    (set, get) => ({
      unlockedPrompts: [],
      sessionId: '',
      
      hasUnlockedPrompt: (promptId: string) => {
        const { unlockedPrompts } = get();
        return unlockedPrompts.some(prompt => prompt.promptId === promptId);
      },
      
      unlockPrompt: (promptId: string) => {
        const { unlockedPrompts, hasUnlockedPrompt } = get();
        
        // Don't add duplicates
        if (hasUnlockedPrompt(promptId)) return;
        
        set({
          unlockedPrompts: [
            ...unlockedPrompts,
            {
              promptId,
              unlockedAt: Date.now()
            }
          ]
        });
      },
      
      getUnlockedPrompts: () => {
        const { unlockedPrompts } = get();
        return unlockedPrompts.map(prompt => prompt.promptId);
      }
    }),
    {
      name: 'unlocked-prompts-storage',
      onRehydrateStorage: () => {
        // When rehydrating storage, update the session ID
        return (state) => {
          if (state) {
            state.sessionId = getOrCreateSessionId();
            
            // If session validation fails, reset to initial state
            // This prevents exploits
            if (!isValidSession()) {
              state.unlockedPrompts = [];
            }
          }
        };
      }
    }
  )
);
