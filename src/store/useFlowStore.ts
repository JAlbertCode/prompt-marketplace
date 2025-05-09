import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PromptFlow } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FlowState {
  flows: PromptFlow[];
  addFlow: (flow: Omit<PromptFlow, 'id' | 'createdAt'>) => string;
  getFlow: (id: string) => PromptFlow | undefined;
  removeFlow: (id: string) => void;
  updateFlow: (id: string, flowData: Partial<PromptFlow>) => void;
  resetStore: () => void;
  getPublicFlows: () => PromptFlow[];
  getUserFlows: (userId: string) => PromptFlow[];
}

// Sample flows to start with
const initialFlows: PromptFlow[] = [
  {
    id: 'flow-1',
    title: 'Content Creation Flow',
    description: 'Generate a blog post and create a matching DALL-E image in two steps',
    steps: [
      {
        id: 'step-1',
        promptId: '1', // Blog Post Generator
        model: 'gpt-4o',
        inputType: 'text',
        outputType: 'text',
        order: 0
      },
      {
        id: 'step-2',
        promptId: '7', // Marketing Image Description Creator
        model: 'sonar-medium-chat',
        inputType: 'text',
        outputType: 'text',
        order: 1
      }
    ],
    creatorId: 'system',
    creatorName: 'PromptFlow',
    visibility: 'public',
    tags: ['content', 'blog', 'image'],
    createdAt: new Date(),
    runCount: 0,
    price: 0 // Free flow
  }
];

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      flows: initialFlows,
      
      addFlow: (flowData) => {
        const id = uuidv4();
        const newFlow: PromptFlow = {
          ...flowData,
          id,
          createdAt: new Date()
        };
        
        set((state) => ({
          flows: [...state.flows, newFlow]
        }));
        
        return id;
      },
      
      getFlow: (id) => {
        const flows = get().flows;
        if (!flows || !Array.isArray(flows)) {
          console.error('Flows array is not available or not in the correct format');
          return undefined;
        }
        return flows.find(flow => flow.id === id);
      },
      
      removeFlow: (id) => {
        const flows = get().flows;
        if (!flows || !Array.isArray(flows)) {
          console.error('Cannot remove flow: flows array is not available');
          return;
        }
        
        set((state) => ({
          flows: state.flows.filter(flow => flow.id !== id)
        }));
      },
      
      updateFlow: (id, flowData) => {
        set((state) => ({
          flows: state.flows.map(flow => 
            flow.id === id ? { ...flow, ...flowData } : flow
          )
        }));
      },
      
      resetStore: () => {
        set({ flows: initialFlows });
      },
      
      getPublicFlows: () => {
        const flows = get().flows;
        if (!flows || !Array.isArray(flows)) {
          return [];
        }
        return flows.filter(flow => flow.visibility === 'public');
      },
      
      getUserFlows: (userId) => {
        const flows = get().flows;
        if (!flows || !Array.isArray(flows)) {
          return [];
        }
        return flows.filter(flow => {
          // Return flows that are either:
          // 1. Public flows
          // 2. User's private or unlisted flows
          return flow.visibility === 'public' || 
                 (flow.visibility !== 'public' && flow.creatorId === userId);
        });
      }
    }),
    {
      name: 'flow-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : null),
      partialize: (state) => ({ flows: state.flows }),
      // Merge strategy to handle combining existing localStorage data with new templates
      merge: (persistedState: any, currentState) => {
        // If persistedState doesn't have a valid flows array, use currentState
        if (!persistedState || !persistedState.flows || !Array.isArray(persistedState.flows)) {
          return { ...currentState };
        }
        
        // Identify default templates by fixed IDs
        const defaultTemplateIds = new Set(['flow-1']);
        
        // Get existing non-default template IDs to preserve user-created flows
        const userFlows = persistedState.flows.filter((f: PromptFlow) => !defaultTemplateIds.has(f.id));
        
        // Get default templates from current state (guaranteed to be there)
        const defaultFlows = currentState.flows.filter(f => defaultTemplateIds.has(f.id));
        
        // Merge user-created flows with default templates
        return {
          ...currentState,
          flows: [...defaultFlows, ...userFlows],
        };
      }
    }
  )
);
