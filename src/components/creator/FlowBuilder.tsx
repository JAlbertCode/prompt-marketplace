'use client';

import React, { useState, useEffect } from 'react';
import { PromptFlow, FlowStep, Prompt, InputMapping } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { calculateFlowCreditCost, validateFlowSteps } from '@/lib/utils/flowValidator';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

interface FlowBuilderProps {
  initialFlow?: Partial<PromptFlow>;
  onSave: (flow: Omit<PromptFlow, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  initialFlow,
  onSave,
  onCancel
}) => {
  const { prompts } = usePromptStore();
  
  const [title, setTitle] = useState(initialFlow?.title || '');
  const [description, setDescription] = useState(initialFlow?.description || '');
  const [steps, setSteps] = useState<FlowStep[]>(initialFlow?.steps || []);
  const [unlockPrice, setUnlockPrice] = useState(initialFlow?.unlockPrice || 0);
  const [isPrivate, setIsPrivate] = useState(initialFlow?.isPrivate || false);
  const [isDraft, setIsDraft] = useState(initialFlow?.isDraft !== false); // Default to draft
  
  // Create a map of prompts by ID for easy lookup
  const promptsMap = React.useMemo(() => {
    return prompts.reduce((acc, prompt) => {
      acc[prompt.id] = prompt;
      return acc;
    }, {} as Record<string, Prompt>);
  }, [prompts]);
  
  // Calculate total credit cost whenever steps change
  const totalCreditCost = React.useMemo(() => {
    return calculateFlowCreditCost(steps, promptsMap);
  }, [steps, promptsMap]);
  
  // Add an initial step if none exist
  useEffect(() => {
    if (steps.length === 0 && prompts.length > 0) {
      addStep();
    }
  }, [prompts]);
  
  const addStep = () => {
    // Get first available prompt
    const firstPrompt = prompts[0];
    if (!firstPrompt) {
      toast.error('No prompts available. Please create a prompt first.');
      return;
    }
    
    const newStep: FlowStep = {
      id: uuidv4(),
      promptId: firstPrompt.id,
      order: steps.length,
      inputMappings: firstPrompt.inputFields.map(field => ({
        targetInputId: field.id,
        sourceType: 'user',
        userInputId: field.id
      }))
    };
    
    setSteps([...steps, newStep]);
  };
  
  const removeStep = (id: string) => {
    if (steps.length <= 1) {
      toast.error('At least one step is required');
      return;
    }
    
    // Remove the step
    const newSteps = steps.filter(step => step.id !== id);
    
    // Reorder remaining steps
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }));
    
    setSteps(reorderedSteps);
  };
  
  const updateStep = (id: string, updates: Partial<FlowStep>) => {
    setSteps(
      steps.map(step => 
        step.id === id ? { ...step, ...updates } : step
      )
    );
  };
  
  const updatePromptForStep = (stepId: string, promptId: string) => {
    const step = steps.find(s => s.id === stepId);
    const newPrompt = promptsMap[promptId];
    
    if (!step || !newPrompt) return;
    
    // Create default input mappings for the new prompt
    const newMappings = newPrompt.inputFields.map(field => ({
      targetInputId: field.id,
      sourceType: 'user' as const,
      userInputId: field.id
    }));
    
    updateStep(stepId, { 
      promptId, 
      inputMappings: newMappings 
    });
  };
  
  const updateInputMapping = (stepId: string, mapping: InputMapping) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const step = steps[stepIndex];
    
    // Find if mapping for this targetInputId already exists
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
    
    updateStep(stepId, { inputMappings: updatedMappings });
  };
  
  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    // Can't move first step up or last step down
    if ((direction === 'up' && stepIndex === 0) || 
        (direction === 'down' && stepIndex === steps.length - 1)) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    // Swap steps
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Update order values
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }));
    
    setSteps(reorderedSteps);
  };
  
  const handleSubmit = (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (steps.length === 0) {
      toast.error('At least one step is required');
      return;
    }
    
    // Validate flow steps for compatibility
    const validation = validateFlowSteps(steps, promptsMap);
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Invalid flow configuration');
      return;
    }
    
    const newFlow: Omit<PromptFlow, 'id' | 'createdAt'> = {
      title,
      description,
      steps,
      totalCreditCost,
      isPrivate,
      isDraft: saveAsDraft,
      unlockPrice
    };
    
    onSave(newFlow);
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={(e) => handleSubmit(e, isDraft)}>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Flow Information</h2>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Give your flow a descriptive title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe what your flow does"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="unlockPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Unlock Price (Credits)
              </label>
              <input
                type="number"
                id="unlockPrice"
                value={unlockPrice}
                onChange={(e) => setUnlockPrice(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Credits required to unlock this flow (0 for free)
              </p>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                  Private (only visible to you)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDraft"
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isDraft" className="ml-2 block text-sm text-gray-700">
                  Save as draft (not published to marketplace)
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Flow Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Add Step
            </button>
          </div>
          
          {steps.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">No steps added yet. Click "Add Step" to start building your flow.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {steps.map((step, index) => {
                const prompt = promptsMap[step.promptId];
                if (!prompt) return null;
                
                return (
                  <div key={step.id} className="border border-gray-200 rounded-md p-4 relative">
                    <div className="absolute top-0 left-0 -mt-3 -ml-1 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    
                    <div className="flex justify-between items-center mb-3 mt-1">
                      <h3 className="font-medium">{step.title || prompt.title}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => moveStep(step.id, 'up')}
                          disabled={index === 0}
                          className={`text-gray-600 hover:text-gray-800 text-sm ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(step.id, 'down')}
                          disabled={index === steps.length - 1}
                          className={`text-gray-600 hover:text-gray-800 text-sm ${index === steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="text-red-600 hover:text-red-800 text-sm ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor={`step-${step.id}-title`} className="block text-sm font-medium text-gray-700 mb-1">
                        Step Title
                      </label>
                      <input
                        type="text"
                        id={`step-${step.id}-title`}
                        value={step.title || ''}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={prompt.title}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor={`step-${step.id}-prompt`} className="block text-sm font-medium text-gray-700 mb-1">
                        Select Prompt
                      </label>
                      <select
                        id={`step-${step.id}-prompt`}
                        value={step.promptId}
                        onChange={(e) => updatePromptForStep(step.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {prompts.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Cost: {prompt.creditCost} credits
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-indigo-50 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Total Flow Cost</h3>
                <p className="text-sm text-gray-600">
                  Sum of all prompt costs in this flow
                </p>
              </div>
              <div className="text-xl font-bold text-indigo-700">
                {totalCreditCost} credits
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isDraft ? 'Save as Draft' : 'Publish Flow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlowBuilder;
