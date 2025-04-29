import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PromptFlow, FlowStep, InputMapping } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FlowState {
  flows: PromptFlow[];
  addFlow: (flow: Omit<PromptFlow, 'id' | 'createdAt'>) => string;
  getFlow: (id: string) => PromptFlow | undefined;
  removeFlow: (id: string) => void;
  updateFlow: (id: string, flowData: Partial<PromptFlow>) => void;
  publishFlow: (id: string, unlockPrice?: number) => void;
  resetStore: () => void;
  getPublicFlows: () => PromptFlow[];
  getUserFlows: (userId: string) => PromptFlow[];
  addStepToFlow: (flowId: string, step: Omit<FlowStep, 'id'>) => string;
  removeStepFromFlow: (flowId: string, stepId: string) => void;
  updateStepInFlow: (flowId: string, stepId: string, stepData: Partial<FlowStep>) => void;
  reorderStepsInFlow: (flowId: string, stepIds: string[]) => void;
  updateInputMapping: (flowId: string, stepId: string, mapping: InputMapping) => void;
}

// Sample flows to start with
const initialFlows: PromptFlow[] = [
  {
    id: 'flow-1',
    title: 'Content Creation Flow',
    description: 'Generate blog content and marketing images in one flow',
    steps: [
      {
        id: 'step-1',
        promptId: '1', // Blog Post Generator
        order: 0,
        title: 'Generate Blog Post',
        inputMappings: [
          {
            targetInputId: 'topic',
            sourceType: 'user',
            userInputId: 'flowTopic'
          },
          {
            targetInputId: 'tone',
            sourceType: 'user',
            userInputId: 'flowTone'
          },
          {
            targetInputId: 'targetAudience',
            sourceType: 'user',
            userInputId: 'flowAudience'
          }
        ]
      },
      {
        id: 'step-2',
        promptId: '7', // Marketing Image Creator
        order: 1,
        title: 'Create Featured Image',
        inputMappings: [
          {
            targetInputId: 'product',
            sourceType: 'previousStep',
            sourceStepId: 'step-1',
            sourceOutputPath: 'title'
          },
          {
            targetInputId: 'style',
            sourceType: 'user',
            userInputId: 'imageStyle'
          },
          {
            targetInputId: 'audience',
            sourceType: 'user',
            userInputId: 'flowAudience'
          }
        ]
      }
    ],
    totalCreditCost: 200, // 50 + 150
    createdAt: Date.now(),
    unlockPrice: 0, // Free flow
    exampleOutput: "This flow generates both a full blog post and a matching featured image based on your topic, tone, and target audience. The image will be styled according to your preference while maintaining consistency with the blog content."
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
          createdAt: Date.now()
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
      
      publishFlow: (id, unlockPrice = 0) => {
        set((state) => ({
          flows: state.flows.map(flow => 
            flow.id === id ? { 
              ...flow, 
              isDraft: false,
              unlockPrice
            } : flow
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
        return flows.filter(flow => !flow.isPrivate && !flow.isDraft);
      },
      
      getUserFlows: (userId) => {
        const flows = get().flows;
        if (!flows || !Array.isArray(flows)) {
          return [];
        }
        return flows.filter(flow => {
          // Return flows that are either:
          // 1. Public flows
          // 2. Private flows owned by this user
          // 3. Draft flows owned by this user
          return (!flow.isPrivate && !flow.isDraft) || 
                 ((flow.isPrivate || flow.isDraft) && flow.ownerId === userId);
        });
      },
      
      addStepToFlow: (flowId, stepData) => {
        const stepId = uuidv4();
        
        set((state) => ({
          flows: state.flows.map(flow => {
            if (flow.id === flowId) {
              const newStep: FlowStep = {
                ...stepData,
                id: stepId
              };
              
              // Calculate new totalCreditCost based on the prompts used
              // This would need to get the prompt cost from the prompt store in a real implementation
              
              return {
                ...flow,
                steps: [...flow.steps, newStep]
              };
            }
            return flow;
          })
        }));
        
        return stepId;
      },
      
      removeStepFromFlow: (flowId, stepId) => {
        set((state) => ({
          flows: state.flows.map(flow => {
            if (flow.id === flowId) {
              const newSteps = flow.steps.filter(step => step.id !== stepId);
              
              // Reorder the remaining steps
              const reorderedSteps = newSteps.map((step, index) => ({
                ...step,
                order: index
              }));
              
              return {
                ...flow,
                steps: reorderedSteps
              };
            }
            return flow;
          })
        }));
      },
      
      updateStepInFlow: (flowId, stepId, stepData) => {
        set((state) => ({
          flows: state.flows.map(flow => {
            if (flow.id === flowId) {
              const updatedSteps = flow.steps.map(step =>
                step.id === stepId ? { ...step, ...stepData } : step
              );
              
              return {
                ...flow,
                steps: updatedSteps
              };
            }
            return flow;
          })
        }));
      },
      
      reorderStepsInFlow: (flowId, stepIds) => {
        set((state) => ({
          flows: state.flows.map(flow => {
            if (flow.id === flowId) {
              // Create a map of the original steps by ID for quick lookup
              const stepsMap = flow.steps.reduce((map, step) => {
                map[step.id] = step;
                return map;
              }, {} as Record<string, FlowStep>);
              
              // Create reordered steps array using the provided order of IDs
              const reorderedSteps = stepIds.map((id, index) => ({
                ...stepsMap[id],
                order: index
              }));
              
              return {
                ...flow,
                steps: reorderedSteps
              };
            }
            return flow;
          })
        }));
      },
      
      updateInputMapping: (flowId, stepId, mapping) => {
        set((state) => ({
          flows: state.flows.map(flow => {
            if (flow.id === flowId) {
              const updatedSteps = flow.steps.map(step => {
                if (step.id === stepId) {
                  // Find if this mapping already exists for this target input
                  const existingMappingIndex = step.inputMappings.findIndex(
                    m => m.targetInputId === mapping.targetInputId
                  );
                  
                  let updatedMappings;
                  
                  if (existingMappingIndex >= 0) {
                    // Update existing mapping
                    updatedMappings = [...step.inputMappings];
                    updatedMappings[existingMappingIndex] = mapping;
                  } else {
                    // Add new mapping
                    updatedMappings = [...step.inputMappings, mapping];
                  }
                  
                  return {
                    ...step,
                    inputMappings: updatedMappings
                  };
                }
                return step;
              });
              
              return {
                ...flow,
                steps: updatedSteps
              };
            }
            return flow;
          })
        }));
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
