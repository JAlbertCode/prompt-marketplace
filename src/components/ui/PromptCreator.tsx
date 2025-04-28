import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Prompt, InputField, SonarModel } from '@/types';
import { usePromptStore } from '@/store/usePromptStore';
import { validateInputFields, validateSystemPrompt, createInputField } from '@/lib/promptHelpers';
import { getBaselineCost, isValidCreditCost } from '@/lib/creditHelpers';
import { executePrompt } from '@/lib/sonarApi';
import Button from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

const PromptCreator: React.FC = () => {
  const router = useRouter();
  const { addPrompt } = usePromptStore();
  
  // Basic form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [inputFields, setInputFields] = useState<InputField[]>([
    createInputField('Input', 'Enter your input here')
  ]);
  const [model, setModel] = useState<SonarModel>('sonar-medium-chat');
  const [creditCost, setCreditCost] = useState(getBaselineCost('sonar-medium-chat'));
  
  // Test state
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Set the credit cost based on the model whenever it changes
  useEffect(() => {
    const baselineCost = getBaselineCost(model);
    if (creditCost < baselineCost) {
      setCreditCost(baselineCost);
    }
  }, [model]);
  
  const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestInputs(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleTestPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before testing');
      return;
    }
    
    // Check if test inputs are provided
    const missingFields = inputFields
      .filter(field => field.required && !testInputs[field.id])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required test fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the Sonar API
      const result = await executePrompt(
        systemPrompt,
        testInputs,
        model
      );
      
      // Set the output
      setTestOutput(result);
      
      // Show success notification
      toast.success('Test successful!');
    } catch (err) {
      console.error('Error testing prompt:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to test prompt');
    } finally {
      setIsLoading(false);
    }
  };
  
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
    
    // Check if credit cost is valid for the selected model
    const baselineCost = getBaselineCost(model);
    if (!isValidCreditCost(creditCost, model)) {
      newErrors.creditCost = `Credit cost must be at least ${baselineCost} for the ${model} model`;
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
    
    // If we haven't tested the prompt yet, show a confirmation
    if (!testOutput) {
      if (!window.confirm('You haven\'t tested your prompt yet. We recommend testing it before creating. Continue anyway?')) {
        return;
      }
    }
    
    try {
      setIsSaving(true);
      
      // Create new prompt
      const promptData: Omit<Prompt, 'id' | 'createdAt'> = {
        title,
        description,
        systemPrompt,
        inputFields,
        model,
        creditCost,
        // If we've tested the prompt, use the test output as an example
        exampleOutput: testOutput || undefined
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
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Create New Prompt</h2>
        <p className="text-sm text-gray-600 mt-1">
          Design a custom prompt to publish to the marketplace
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
                onChange={(e) => {
                  const newModel = e.target.value as SonarModel;
                  setModel(newModel);
                  
                  // Update credit cost based on model baseline
                  const baselineCost = getBaselineCost(newModel);
                  if (creditCost < baselineCost) {
                    setCreditCost(baselineCost);
                  }
                }}
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
              <div className="relative">
                <input
                  type="number"
                  id="creditCost"
                  value={creditCost}
                  onChange={(e) => setCreditCost(parseInt(e.target.value) || 0)}
                  min={getBaselineCost(model)}
                  max={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Baseline cost: {getBaselineCost(model)} credits (minimum for {model.split('-')[1] || 'this'} model)
                </div>
              </div>
              {errors.creditCost && (
                <p className="text-sm text-red-600">{errors.creditCost}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Test Your Prompt */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700">Test Your Prompt</h3>
          <p className="text-sm text-gray-500">
            Try out your prompt with sample inputs before publishing it to the marketplace.
          </p>
          
          <div className="space-y-4">
            {inputFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label
                  htmlFor={`test-${field.id}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}{field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.label.toLowerCase().includes('code') || 
                 field.placeholder.toLowerCase().includes('code') ? (
                  <textarea
                    id={`test-${field.id}`}
                    name={field.id}
                    placeholder={field.placeholder}
                    value={testInputs[field.id] || ''}
                    onChange={handleTestInputChange}
                    required={field.required}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    id={`test-${field.id}`}
                    name={field.id}
                    placeholder={field.placeholder}
                    value={testInputs[field.id] || ''}
                    onChange={handleTestInputChange}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={handleTestPrompt}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <LoadingIndicator size="sm" className="mr-2" />
                  Testing...
                </span>
              ) : (
                'Test Prompt'
              )}
            </Button>
          </div>
        </div>
        
        {/* Test Output */}
        {testOutput && (
          <div className="space-y-2 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Output Preview</h4>
            <div className="bg-white border border-gray-300 rounded-md p-3 text-sm text-gray-800 whitespace-pre-wrap shadow-inner max-h-80 overflow-y-auto">
              {testOutput}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This output will be saved as an example for users to preview when browsing prompts.
            </p>
          </div>
        )}
        
        {/* Submit */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <LoadingIndicator size="sm" className="mr-2" />
                Saving...
              </span>
            ) : (
              'Create Prompt'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptCreator;
