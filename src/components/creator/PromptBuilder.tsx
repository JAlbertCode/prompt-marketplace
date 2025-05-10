'use client';

import React, { useState, useEffect } from 'react';
import { Prompt, SonarModel, ImageModel, InputField } from '@/types';
import ModelSelector from './ModelSelector';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { usePromptStore } from '@/store/usePromptStore';
import { getModelById, getCostBreakdown } from '@/lib/models/modelRegistry';

interface PromptBuilderProps {
  initialPrompt?: Partial<Prompt>;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  editId?: string;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  initialPrompt,
  onSave,
  onCancel,
  editId
}) => {
  console.log('PromptBuilder rendering with initialPrompt:', initialPrompt);
  console.log('EditId:', editId);
  
  // Initialize state with default empty values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [creatorFee, setCreatorFee] = useState(0);
  const [unlockFee, setUnlockFee] = useState(0);
  const [creditCost, setCreditCost] = useState(0);
  const [model, setModel] = useState<string>('gpt-4o');
  const [imageModel, setImageModel] = useState<ImageModel | undefined>(undefined);
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [capabilities, setCapabilities] = useState<('text' | 'image' | 'code')[]>(['text']);
  const [outputType, setOutputType] = useState<'text' | 'image'>('text');
  
  // Track if form has been initialized with data
  const [isInitialized, setIsInitialized] = useState(false);

  // Add default input field if none exist
  useEffect(() => {
    if (inputFields.length === 0 && isInitialized) {
      console.log('No input fields after initialization, adding default field');
      addInputField();
    }
  }, [inputFields, isInitialized]);

  // Update form values when initialPrompt changes
  useEffect(() => {
    console.log('initialPrompt changed:', initialPrompt);
    
    // If we have a valid initialPrompt with an id, initialize the form
    if (initialPrompt && Object.keys(initialPrompt).length > 0) {
      // Only initialize once with non-empty data
      if (!isInitialized) {
        console.log('Initializing form with data:', JSON.stringify(initialPrompt, null, 2));
        
        // Track which fields we're initializing
        const initializedFields: Record<string, any> = {};
        
        // Basic text fields
        setTitle(initialPrompt.title || '');
        initializedFields.title = initialPrompt.title;
        
        setDescription(initialPrompt.description || '');
        initializedFields.description = initialPrompt.description;
        
        // Handle both old and new prompt formats
        const promptContent = initialPrompt.systemPrompt || initialPrompt.content || '';
        setSystemPrompt(promptContent);
        initializedFields.systemPrompt = promptContent;
        
        // Numeric fields
        const fee = typeof initialPrompt.creatorFee === 'number' ? initialPrompt.creatorFee : 0;
        setCreatorFee(fee);
        initializedFields.creatorFee = fee;
        
        // Set unlock fee if available
        const unlockFeeValue = typeof initialPrompt.unlockFee === 'number' ? initialPrompt.unlockFee : 0;
        setUnlockFee(unlockFeeValue);
        initializedFields.unlockFee = unlockFeeValue;
        
        const cost = typeof initialPrompt.creditCost === 'number' ? initialPrompt.creditCost : 0;
        setCreditCost(cost);
        initializedFields.creditCost = cost;
        
        // Model selection
        const modelId = initialPrompt.model || 'gpt-4o';
        setModel(modelId);
        initializedFields.model = modelId;
        
        if (initialPrompt.imageModel) {
          setImageModel(initialPrompt.imageModel);
          initializedFields.imageModel = initialPrompt.imageModel;
        }
        
        // Handle input fields carefully
        if (initialPrompt.inputFields && Array.isArray(initialPrompt.inputFields) && initialPrompt.inputFields.length > 0) {
          console.log('Setting input fields:', initialPrompt.inputFields);
          setInputFields(initialPrompt.inputFields);
          initializedFields.inputFields = initialPrompt.inputFields;
        } else {
          // Add default input field if none exist
          console.log('No input fields found, adding default');
          const defaultField: InputField = {
            id: uuidv4(),
            label: 'Prompt',
            placeholder: 'Enter your prompt here',
            required: true,
            type: 'text'
          };
          setInputFields([defaultField]);
          initializedFields.inputFields = [defaultField];
        }
        
        // Boolean fields
        const isPrivateValue = initialPrompt.isPrivate !== undefined ? initialPrompt.isPrivate : true;
        setIsPrivate(isPrivateValue);
        initializedFields.isPrivate = isPrivateValue;
        
        // Arrays and enums
        const caps = Array.isArray(initialPrompt.capabilities) ? initialPrompt.capabilities : ['text'];
        setCapabilities(caps);
        initializedFields.capabilities = caps;
        
        const outType = initialPrompt.outputType || (initialPrompt.imageModel ? 'image' : 'text');
        setOutputType(outType as 'text' | 'image');
        initializedFields.outputType = outType;
        
        setIsInitialized(true);
        console.log('Form initialized with fields:', initializedFields);
      }
    } else {
      console.warn('Invalid or empty initialPrompt received:', initialPrompt);
    }
  }, [initialPrompt, isInitialized]);
  
  // Calculate total cost whenever the model or fee changes
  useEffect(() => {
    // Get the model information
    const modelInfo = getModelById(model);
    
    if (!modelInfo) {
      // Default to 10000 credits if model not found
      setCreditCost(10000 + creatorFee);
      return;
    }
    
    // Creator fee must be at least 0
    const safeFee = Math.max(0, creatorFee);
    
    // Get cost breakdown for medium prompt
    const costBreakdown = getCostBreakdown(model, 'medium', safeFee);
    
    // Update total cost
    setCreditCost(costBreakdown.totalCost);
  }, [model, creatorFee]);
  
  // Update capabilities based on selected model
  useEffect(() => {
    const selectedModel = getModelById(model);
    if (selectedModel) {
      // Update capabilities based on model type
      const newCapabilities: ('text' | 'image' | 'code')[] = [];
      
      if (selectedModel.type === 'text' || selectedModel.capabilities.includes('text')) {
        newCapabilities.push('text');
      }
      
      if (selectedModel.type === 'image' || selectedModel.capabilities.includes('image')) {
        newCapabilities.push('image');
      }
      
      if (selectedModel.capabilities.includes('code')) {
        newCapabilities.push('code');
      }
      
      // Only update if capabilities have changed
      if (JSON.stringify(newCapabilities.sort()) !== JSON.stringify(capabilities.sort())) {
        setCapabilities(newCapabilities);
      }
      
      // Update output type based on model type
      if (selectedModel.type === 'image' && outputType !== 'image') {
        setOutputType('image');
      } else if (selectedModel.type === 'text' && outputType !== 'text') {
        setOutputType('text');
      }
      
      // For image models, set the imageModel too
      if (selectedModel.type === 'image') {
        setImageModel(selectedModel.id as ImageModel);
      }
    }
  }, [model]);

  const addInputField = () => {
    const newField: InputField = {
      id: uuidv4(),
      label: '',
      placeholder: '',
      required: true,
      type: 'text'
    };

    setInputFields([...inputFields, newField]);
  };

  const removeInputField = (id: string) => {
    if (inputFields.length <= 1) {
      toast.error('At least one input field is required');
      return;
    }
    setInputFields(inputFields.filter(field => field.id !== id));
  };

  const updateInputField = (id: string, updates: Partial<InputField>) => {
    setInputFields(
      inputFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Validate all required fields
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!systemPrompt.trim()) {
      toast.error('System prompt is required');
      return;
    }
    
    if (inputFields.some(field => !field.label.trim())) {
      toast.error('All input fields must have a label');
      return;
    }
    
    // If image capability but no image model selected
    if (capabilities.includes('image') && outputType === 'image' && !imageModel) {
      toast.error('Please select an image model');
      return;
    }
    
    console.log('Form validation passed, preparing data to save');
    console.log('Current form values:', {
      title,
      description,
      systemPrompt: systemPrompt.substring(0, 100) + '...', // Truncate for log
      inputFields,
      model,
      creditCost,
      creatorFee,
      isPrivate,
      capabilities,
      outputType,
      imageModel
    });
    
    // Prepare the prompt data with all required fields
    const newPrompt: Omit<Prompt, 'id' | 'createdAt'> = {
      title,
      description,
      systemPrompt,  // New field format
      content: undefined, // Explicitly clear old format
      inputFields: inputFields.map(field => ({
        ...field,
        // Ensure all fields have required properties
        required: field.required !== undefined ? field.required : true,
        type: field.type || 'text'
      })),
      model,
      creditCost,
      creatorFee,
      unlockFee,
      isPrivate,
      capabilities,
      outputType,
      // Set visibility based on isPrivate
      visibility: isPrivate ? 'private' : 'public'
    };
    
    // Add image model if needed
    if (capabilities.includes('image') && imageModel) {
      newPrompt.imageModel = imageModel;
    }
    
    console.log('Saving prompt:', newPrompt);
    onSave(newPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        
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
            placeholder="Give your prompt a descriptive title"
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
            placeholder="Briefly describe what your prompt does"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt <span className="text-red-500">*</span>
          </label>
          <div className="bg-yellow-50 border border-yellow-100 p-2 rounded-md mb-2 text-xs text-yellow-800">
            This will be hidden from users running your prompt. It provides instructions to the AI.
          </div>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            placeholder="You are an expert at..."
            required
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Model & Capabilities</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Model <span className="text-red-500">*</span>
          </label>
          <ModelSelector 
            currentModel={model} 
            onChange={setModel} 
          />
        </div>
        
        {/* Display model capabilities */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Capabilities
          </label>
          <div className="flex flex-wrap gap-2">
            {capabilities.map(capability => (
              <span 
                key={capability}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  capability === 'text' ? 'bg-blue-100 text-blue-800' :
                  capability === 'image' ? 'bg-pink-100 text-pink-800' :
                  'bg-amber-100 text-amber-800'
                }`}
              >
                {capability.charAt(0).toUpperCase() + capability.slice(1)}
              </span>
            ))}
          </div>
        </div>
        
        {/* Display output type selector for models with multiple capabilities */}
        {capabilities.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Output Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {capabilities.includes('text') && (
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="outputType" 
                    value="text"
                    checked={outputType === 'text'}
                    onChange={() => setOutputType('text')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Text</span>
                </label>
              )}
              {capabilities.includes('image') && (
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="outputType" 
                    value="image"
                    checked={outputType === 'image'}
                    onChange={() => setOutputType('image')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Image</span>
                </label>
              )}
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pricing Breakdown <span className="text-red-500">*</span>
          </label>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">System cost for {model}:</span>
              <span className="font-medium">{model && getModelById(model)?.cost.medium.toLocaleString() || 10000} credits</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Your fee:</span>
              <div className="flex">
                <input
                  type="number"
                  id="creatorFee"
                  value={creatorFee}
                  onChange={(e) => setCreatorFee(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  required
                />
                <span className="ml-2 text-sm text-gray-700 pt-1">credits</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Platform fee (10% of your fee{creatorFee === 0 ? ', min. 100' : ''}):</span>
              <span className="font-medium">{creatorFee > 0 ? Math.max(Math.floor(creatorFee * 0.1), 1) : 100} credits</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-300 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Total user cost:</span>
              <span className="font-bold text-lg text-indigo-600">{creditCost} credits</span>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">System Prompt Unlock Fee:</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Fee to unlock your system prompt:</span>
                <div className="flex">
                  <input
                    type="number"
                    id="unlockFee"
                    value={unlockFee}
                    onChange={(e) => setUnlockFee(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                  />
                  <span className="ml-2 text-sm text-gray-700 pt-1">credits</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set a price for users to unlock and view your system prompt. Set to 0 for free access.
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">What users get for their money:</h4>
              <div className="bg-blue-50 p-2 rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Cost per run:</span>
                  <span className="font-medium">${(creditCost * 0.000001).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Runs per $10:</span>
                  <span className="font-medium">{Math.floor(10000000 / creditCost)} runs</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            These are the credits users will spend each time they run this prompt.
            You'll receive {creatorFee} credits per run, and we take a 10% fee.
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Input Fields</h2>
          <button
            type="button"
            onClick={addInputField}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Add Field
          </button>
        </div>
        
        <div className="space-y-4">
          {inputFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Field {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeInputField(field.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`field-${field.id}-label`} className="block text-sm font-medium text-gray-700 mb-1">
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`field-${field.id}-label`}
                    value={field.label}
                    onChange={(e) => updateInputField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Topic"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor={`field-${field.id}-placeholder`} className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    id={`field-${field.id}-placeholder`}
                    value={field.placeholder}
                    onChange={(e) => updateInputField(field.id, { placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Enter a topic..."
                  />
                </div>
                
                <div>
                  <label htmlFor={`field-${field.id}-type`} className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id={`field-${field.id}-type`}
                    value={field.type || 'text'}
                    onChange={(e) => updateInputField(field.id, { type: e.target.value as 'text' | 'textarea' | 'select' | 'image' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`field-${field.id}-required`}
                    checked={field.required}
                    onChange={(e) => updateInputField(field.id, { required: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`field-${field.id}-required`} className="ml-2 block text-sm text-gray-700">
                    Required field
                  </label>
                </div>
              </div>

              {/* Select options editor */}
              {field.type === 'select' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Options
                  </label>
                  <div className="space-y-2">
                    {(field.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(field.options || [])];
                            newOptions[optionIndex] = e.target.value;
                            updateInputField(field.id, { options: newOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = [...(field.options || [])];
                            newOptions.splice(optionIndex, 1);
                            updateInputField(field.id, { options: newOptions });
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <span className="sr-only">Remove option</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...(field.options || []), ''];
                        updateInputField(field.id, { options: newOptions });
                      }}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:ring-blue-300 active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Publishing Options</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700">
            Publish to marketplace
          </label>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
          <p>
            <strong>Important:</strong> When publishing your prompt to the marketplace, 
            the system will automatically generate an example output using your prompt. 
            This will cost you credits equal to one run of your prompt.
          </p>
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
          {isPublished ? 'Save & Publish Prompt' : 'Save Prompt'}
        </button>
      </div>
    </form>
  );
};

export default PromptBuilder;