import { create } from 'zustand';
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

// Empty initial flows
const initialFlows: PromptFlow[] = [];

export const useFlowStore = create<FlowState>(
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
  })
);
