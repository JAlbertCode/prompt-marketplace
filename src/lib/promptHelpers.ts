/**
 * Utilities for working with prompts
 */

import { v4 as uuidv4 } from 'uuid';
import { InputField, Prompt } from '@/types';

/**
 * Create a new input field with optional defaults
 * @param label Default label for the field
 * @param placeholder Default placeholder for the field
 * @returns A new input field object
 */
export function createInputField(
  label: string = '',
  placeholder: string = ''
): InputField {
  return {
    id: uuidv4(),
    label,
    placeholder,
    required: true,
    type: 'text'
  };
}

/**
 * Validate a system prompt
 * @param systemPrompt The system prompt to validate
 * @returns True if the prompt is valid, false otherwise
 */
export function validateSystemPrompt(systemPrompt: string): boolean {
  return systemPrompt.trim().length >= 10;
}

/**
 * Validate input fields
 * @param inputFields The input fields to validate
 * @returns True if the fields are valid, false otherwise
 */
export function validateInputFields(inputFields: InputField[]): boolean {
  // Must have at least one input field
  if (!inputFields || inputFields.length === 0) {
    return false;
  }
  
  // All input fields must have a label
  for (const field of inputFields) {
    if (!field.label || field.label.trim().length === 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format user inputs for API submission
 * @param inputFields The input field definitions
 * @param inputValues The input values
 * @returns A record of formatted inputs
 */
export function formatUserInputs(
  inputFields: InputField[],
  inputValues: Record<string, string>
): Record<string, string> {
  // Start with an empty object
  const formattedInputs: Record<string, string> = {};
  
  // Format each input field
  for (const field of inputFields) {
    // Get the value or use an empty string
    const value = inputValues[field.id] || '';
    
    // Add to formatted inputs
    formattedInputs[field.label] = value;
  }
  
  return formattedInputs;
}

/**
 * Generate a simplified prompt data object for API requests
 * @param prompt The full prompt object
 * @returns A simplified prompt data object
 */
export function simplifyPromptForApi(prompt: Prompt): any {
  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    inputFields: prompt.inputFields.map(field => ({
      id: field.id,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      type: field.type
    })),
    model: prompt.model,
    creditCost: prompt.creditCost,
    capabilities: prompt.capabilities || ['text']
  };
}

/**
 * Extract input placeholders as a record
 * @param inputFields The input fields to extract placeholders from
 * @returns A record of placeholders
 */
export function getInputPlaceholders(
  inputFields: InputField[]
): Record<string, string> {
  return inputFields.reduce((acc, field) => {
    acc[field.id] = field.placeholder || '';
    return acc;
  }, {} as Record<string, string>);
}
