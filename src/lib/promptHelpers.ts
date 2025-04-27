import { InputField } from '@/types';

/**
 * Generates a new input field with default values
 */
export function createInputField(label = '', placeholder = ''): InputField {
  return {
    id: generateFieldId(),
    label,
    placeholder,
    required: true
  };
}

/**
 * Generates a simple ID for an input field
 */
function generateFieldId(): string {
  return `field_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Validates input fields to ensure they have at least a label
 */
export function validateInputFields(fields: InputField[]): boolean {
  if (fields.length === 0) return false;
  
  return fields.every(field => field.label.trim() !== '');
}

/**
 * Validates a system prompt
 */
export function validateSystemPrompt(prompt: string): boolean {
  return prompt.trim().length >= 10;
}

/**
 * Formats user inputs according to input field definitions
 */
export function formatUserInputs(
  inputFields: InputField[],
  values: Record<string, string>
): Record<string, string> {
  const formattedInputs: Record<string, string> = {};
  
  for (const field of inputFields) {
    // Get the value or use empty string as fallback
    const value = values[field.id] || '';
    
    // Only include non-empty values
    if (value.trim()) {
      formattedInputs[field.label] = value;
    }
  }
  
  return formattedInputs;
}
