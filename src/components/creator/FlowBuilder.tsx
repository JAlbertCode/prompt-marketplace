'use client';

import React, { useState, useEffect } from 'react';
import { PromptFlow, FlowStep, Prompt, InputMapping } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore';
import { calculateFlowCreditCost, validateFlowSteps } from '@/lib/utils/flowValidator';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

interface FlowBuilderProps {
  initialFlow?: Partial<PromptFlow>;
  onSave: (flow: Omit<PromptFlow, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  editId?: string;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  initialFlow,
  onSave,
  onCancel,
  editId
}) => {
  const { prompts } = usePromptStore();
  const { getFlowById } = useFlowStore();
  
  const [title, setTitle] = useState(initialFlow?.title || '');
  const [description, setDescription] = useState(initialFlow?.description || '');
  const [steps, setSteps] = useState<FlowStep[]>(initialFlow?.steps || []);
  const [unlockPrice, setUnlockPrice] = useState(initialFlow?.unlockPrice || 0);
  const [isPrivate, setIsPrivate] = useState(initialFlow?.isPrivate !== false);
  const [isPublished, setIsPublished] = useState(initialFlow?.isDraft === false);
  
  // Create a map of prompts by ID for easy lookup
  const promptsMap = React.useMemo(() => {
    return prompts.reduce((acc, prompt) => {
      acc[prompt.id] = prompt;
      return acc;
    }, {} as Record<string, Prompt>);
  }, [prompts]);

  // Load flow data if editId is provided
  useEffect(() => {
    if (editId && getFlowById) {
      const flowToEdit = getFlowById(editId);
      if (flowToEdit) {
        setTitle(flowToEdit.title || '');
        setDescription(flowToEdit.description || '');
        setSteps(flowToEdit.steps || []);
        setUnlockPrice(flowToEdit.unlockPrice || 0);
        setIsPrivate(flowToEdit.isPrivate !== false);
        setIsPublished(flowToEdit.isDraft === false);
      }
    }
  }, [editId, getFlowById]);

  // State for prompt search
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Function to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.prompt-search-container')) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
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
      isDraft: !isPublished,
      unlockPrice: isPublished ? unlockPrice : 0
    };
    
    onSave(newFlow);
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
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
          
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                Private (only visible to you and people you share with)
              </label>
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
                      
                      <div className="relative mb-14 prompt-search-container">
                        <div className="flex">
                          <input
                            type="text"
                            id={`step-${step.id}-prompt-search`}
                            placeholder="Search for a prompt..."
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${openDropdownId === step.id ? 'border-indigo-500 rounded-b-none' : 'border-gray-300'}`}
                            onClick={() => setOpenDropdownId(step.id)}
                            onChange={(e) => {
                              setSearchQueries(prev => ({
                                ...prev,
                                [step.id]: e.target.value.toLowerCase()
                              }));
                              // Open dropdown when typing
                              if (e.target.value && openDropdownId !== step.id) {
                                setOpenDropdownId(step.id);
                              }
                            }}
                            value={searchQueries[step.id] || ''}
                          />
                        </div>
                        
                        {openDropdownId === step.id && (
                          <div className="mt-0 absolute w-full z-10 bg-white border border-indigo-500 border-t-0 rounded-md rounded-t-none shadow-lg max-h-64 overflow-y-auto">
                            {/* Favorite prompts section */}
                            <div className="p-2 bg-gray-50 text-xs font-semibold text-gray-700 border-b border-gray-200 sticky top-0">
                              Your Favorite Prompts
                            </div>
                          
                            {prompts
                              .filter(p => {
                                const searchQuery = searchQueries[step.id] || '';
                                const matchesSearch = !searchQuery || 
                                  p.title.toLowerCase().includes(searchQuery) || 
                                  p.description.toLowerCase().includes(searchQuery);
                                return p.isPrivate && matchesSearch;
                              })
                              .slice(0, 5)
                              .map(p => (
                                <div 
                                  key={p.id} 
                                  className={`p-2 hover:bg-indigo-50 cursor-pointer ${p.id === step.promptId ? 'bg-indigo-100' : ''}`}
                                  onClick={() => {
                                    updatePromptForStep(step.id, p.id);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <div className="font-medium text-sm">{p.title}</div>
                                  <div className="text-xs text-gray-500 truncate">{p.description}</div>
                                </div>
                              ))}
                            
                            {/* Divider */}
                            <div className="p-2 bg-gray-50 text-xs font-semibold text-gray-700 border-b border-t border-gray-200 sticky top-0">
                              Marketplace Prompts
                            </div>
                            
                            {prompts
                              .filter(p => {
                                const searchQuery = searchQueries[step.id] || '';
                                const matchesSearch = !searchQuery || 
                                  p.title.toLowerCase().includes(searchQuery) || 
                                  p.description.toLowerCase().includes(searchQuery);
                                return !p.isPrivate && matchesSearch;
                              })
                              .slice(0, 5)
                              .map(p => (
                                <div 
                                  key={p.id} 
                                  className={`p-2 hover:bg-indigo-50 cursor-pointer ${p.id === step.promptId ? 'bg-indigo-100' : ''}`}
                                  onClick={() => {
                                    updatePromptForStep(step.id, p.id);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <div className="font-medium text-sm">{p.title}</div>
                                  <div className="text-xs text-gray-500 truncate">{p.description}</div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-14 pb-2">
                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="font-medium">{prompt.title}</div>
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">{prompt.description}</div>
                            </div>
                            <div>
                              <a 
                                href={`/prompt/${prompt.id}/edit`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit Prompt
                              </a>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between text-xs">
                            <span className="text-gray-500">
                              Cost: <span className="font-semibold">{prompt.creditCost} credits</span>
                            </span>
                            <span className="text-gray-500">
                              Model: <span className="font-semibold">{prompt.model}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-indigo-50 rounded-md">
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
            
            <div className="p-4 bg-orange-50 rounded-md">
              <h3 className="font-medium mb-2">Marketplace Settings</h3>
              <p className="text-sm text-gray-600 mb-3">
                Choose how to make your flow available to others
              </p>
              
              <div className="mb-3">
                <label htmlFor="publishStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  Publishing Status
                </label>
                <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <div className="flex flex-col divide-y divide-gray-200">
                    <label 
                      className={`p-3 flex items-center cursor-pointer ${!isPublished ? 'bg-gray-50' : ''}`}
                      htmlFor="draft"
                    >
                      <input
                        type="radio"
                        id="draft"
                        name="publishStatus"
                        checked={!isPublished}
                        onChange={() => setIsPublished(false)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Save as Draft</span>
                        <span className="block text-xs text-gray-500">
                          Your flow will be saved but not visible on the marketplace
                        </span>
                      </div>
                    </label>
                    <label 
                      className={`p-3 flex items-center cursor-pointer ${isPublished ? 'bg-gray-50' : ''}`}
                      htmlFor="publish"
                    >
                      <input
                        type="radio"
                        id="publish"
                        name="publishStatus"
                        checked={isPublished}
                        onChange={() => setIsPublished(true)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Publish on Marketplace</span>
                        <span className="block text-xs text-gray-500">
                          Your flow will be visible to everyone on the marketplace
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              {isPublished && (
                <div className="mt-4">
                  <label htmlFor="pricingOption" className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Option
                  </label>
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <div className="flex flex-col divide-y divide-gray-200">
                      <label 
                        className={`p-3 flex items-center cursor-pointer ${unlockPrice === 0 ? 'bg-gray-50' : ''}`}
                        htmlFor="free"
                      >
                        <input
                          type="radio"
                          id="free"
                          name="pricingOption"
                          checked={unlockPrice === 0}
                          onChange={() => setUnlockPrice(0)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900">Free for Everyone</span>
                          <span className="block text-xs text-gray-500">
                            Anyone can use this flow without paying credits (they'll still pay for execution)
                          </span>
                        </div>
                      </label>
                      <label 
                        className={`p-3 flex items-center cursor-pointer ${unlockPrice > 0 ? 'bg-gray-50' : ''}`}
                        htmlFor="paid"
                      >
                        <input
                          type="radio"
                          id="paid"
                          name="pricingOption"
                          checked={unlockPrice > 0}
                          onChange={() => unlockPrice === 0 ? setUnlockPrice(500) : null}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div className="ml-3 flex-grow">
                          <span className="block text-sm font-medium text-gray-900">Premium (One-time payment)</span>
                          <div className="flex items-center mt-1">
                            <input
                              type="number"
                              value={unlockPrice}
                              onChange={(e) => setUnlockPrice(Math.max(1, parseInt(e.target.value) || 0))}
                              disabled={unlockPrice === 0}
                              min="1"
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-500">credits</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            <span className="font-medium">You earn 80%</span> ({Math.round(unlockPrice * 0.8)} credits) per unlock
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
            {isPublished ? 'Publish Flow' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlowBuilder;
