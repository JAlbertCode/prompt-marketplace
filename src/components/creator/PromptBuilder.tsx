'use client';

import React, { useState, useEffect } from 'react';
import { Prompt, SonarModel, ImageModel, InputField } from '@/types';
import ModelSelector from './ModelSelector';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

interface PromptBuilderProps {
  initialPrompt?: Partial<Prompt>;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  initialPrompt,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialPrompt?.title || '');
  const [description, setDescription] = useState(initialPrompt?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(initialPrompt?.systemPrompt || '');
  const [creditCost, setCreditCost] = useState(initialPrompt?.creditCost || 50);
  const [model, setModel] = useState<SonarModel>(initialPrompt?.model || 'sonar-medium-chat');
  const [imageModel, setImageModel] = useState<ImageModel | undefined>(initialPrompt?.imageModel);
  const [inputFields, setInputFields] = useState<InputField[]>(initialPrompt?.inputFields || []);
  const [isPrivate, setIsPrivate] = useState(initialPrompt?.isPrivate || false);
  const [capabilities, setCapabilities] = useState<('text' | 'image' | 'code')[]>(
    initialPrompt?.capabilities || ['text']
  );
  const [outputType, setOutputType] = useState<'text' | 'image'>(
    initialPrompt?.outputType || (initialPrompt?.imageModel ? 'image' : 'text')
  );

  // Add default input field if none exist
  useEffect(() => {
    if (inputFields.length === 0) {
      addInputField();
    }
  }, []);

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
    
    const newPrompt: Omit<Prompt, 'id' | 'createdAt'> = {
      title,
      description,
      systemPrompt,
      inputFields,
      model,
      creditCost,
      isPrivate,
      capabilities,
      outputType
    };
    
    // Add image model if needed
    if (capabilities.includes('image') && imageModel) {
      newPrompt.imageModel = imageModel;
    }
    
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
            Text Model <span className="text-red-500">*</span>
          </label>
          <ModelSelector 
            currentModel={model} 
            onChange={setModel} 
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="creditCost" className="block text-sm font-medium text-gray-700 mb-1">
            Credit Cost <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="creditCost"
            value={creditCost}
            onChange={(e) => setCreditCost(Math.max(1, parseInt(e.target.value) || 0))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            How many credits users will spend to run this prompt
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
            </div>
          ))}
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
          Save Prompt
        </button>
      </div>
    </form>
  );
};

export default PromptBuilder;
