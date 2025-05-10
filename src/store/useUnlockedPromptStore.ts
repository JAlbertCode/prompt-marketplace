import { create } from 'zustand';
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
  (set, get) => ({
    unlockedPrompts: [],
    sessionId: typeof window !== 'undefined' ? getOrCreateSessionId() : '',
    
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
  })
);
