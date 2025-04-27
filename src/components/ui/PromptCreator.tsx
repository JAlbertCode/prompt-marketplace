import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Prompt, InputField, SonarModel } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { validateInputFields, validateSystemPrompt, createInputField } from '@/lib/promptHelpers';
import Button from '@/components/shared/Button';

const PromptCreator: React.FC = () => {
  const router = useRouter();
  const { addPrompt } = usePromptStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [inputFields, setInputFields] = useState<InputField[]>([
    createInputField('Input', 'Enter your input here')
  ]);
  const [model, setModel] = useState<SonarModel>('sonar-medium-chat');
  const [creditCost, setCreditCost] = useState(25);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!validateSystemPrompt(systemPrompt)) {
      newErrors.systemPrompt = 'System prompt must be at least 10 characters';
    }
    
    if (!validateInputFields(inputFields)) {
      newErrors.inputFields = 'At least one input field with a label is required';
    }
    
    if (creditCost < 1) {
      newErrors.creditCost = 'Credit cost must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddInputField = () => {
    setInputFields([...inputFields, createInputField()]);
  };
  
  const handleRemoveInputField = (indexToRemove: number) => {
    if (inputFields.length <= 1) {
      toast.error('At least one input field is required');
      return;
    }
    
    setInputFields(inputFields.filter((_, index) => index !== indexToRemove));
  };
  
  const handleInputFieldChange = (index: number, field: Partial<InputField>) => {
    const updatedFields = [...inputFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setInputFields(updatedFields);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      // Create new prompt
      const promptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title,
        description,
        systemPrompt,
        inputFields,
        model,
        creditCost
      };
      
      // Add to store
      const id = addPrompt(promptData);
      
      // Show success notification
      toast.success('Prompt created successfully!');
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error creating prompt:', error);
      toast.error('Failed to create prompt');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Create New Prompt</h2>
        <p className="text-sm text-gray-600 mt-1">
          Design a new prompt to add to the marketplace
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Basic Information</h3>
          
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="E.g., Blog Post Generator"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Brief description of what the prompt does"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
        
        {/* System Prompt */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">System Prompt</h3>
          <p className="text-sm text-gray-500">
            This is the hidden instruction given to the AI. It won't be visible to users.
          </p>
          
          <div className="space-y-1">
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
              System Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Detailed instructions for the AI"
            />
            {errors.systemPrompt && (
              <p className="text-sm text-red-600">{errors.systemPrompt}</p>
            )}
          </div>
        </div>
        
        {/* Input Fields */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-gray-700">Input Fields</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddInputField}
            >
              + Add Field
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Define the input fields users will fill out when running the prompt.
          </p>
          
          {errors.inputFields && (
            <p className="text-sm text-red-600">{errors.inputFields}</p>
          )}
          
          <div className="space-y-4">
            {inputFields.map((field, index) => (
              <div 
                key={field.id} 
                className="p-3 border border-gray-200 rounded-md bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Field {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveInputField(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleInputFieldChange(index, { label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="E.g., Topic"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => handleInputFieldChange(index, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="E.g., Enter a topic"
                    />
                  </div>
                </div>
                
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleInputFieldChange(index, { required: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required field</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-700">Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value as SonarModel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="sonar-small-online">Sonar Small</option>
                <option value="sonar-medium-chat">Sonar Medium</option>
                <option value="sonar-large-online">Sonar Large</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="creditCost" className="block text-sm font-medium text-gray-700">
                Credit Cost <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="creditCost"
                value={creditCost}
                onChange={(e) => setCreditCost(parseInt(e.target.value) || 0)}
                min={1}
                max={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {errors.creditCost && (
                <p className="text-sm text-red-600">{errors.creditCost}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
          
          <Button type="submit">
            Create Prompt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptCreator;
