import { FlowStep, Prompt } from "@/types";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that steps in a flow have compatible input/output types
 * Rules:
 * - Text → Text is allowed
 * - Text → Image is allowed
 * - Image → Text is NOT allowed
 * - Image → Image is NOT allowed
 */
export const validateFlowSteps = (
  steps: FlowStep[],
  promptsMap: Record<string, Prompt>
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };
  
  // Sort steps by order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  
  // Check each step's compatibility with the next
  for (let i = 0; i < sortedSteps.length - 1; i++) {
    const currentStep = sortedSteps[i];
    const nextStep = sortedSteps[i + 1];
    
    const currentPrompt = promptsMap[currentStep.promptId];
    const nextPrompt = promptsMap[nextStep.promptId];
    
    if (!currentPrompt || !nextPrompt) {
      result.isValid = false;
      result.errors.push(`Missing prompt data for step ${i + 1} or ${i + 2}`);
      continue;
    }
    
    // Determine output type of current step
    let currentOutputType: 'text' | 'image' = 'text';
    if (currentPrompt.outputType) {
      currentOutputType = currentPrompt.outputType;
    } else if (currentPrompt.imageModel) {
      currentOutputType = 'image';
    } else if (currentPrompt.capabilities?.includes('image')) {
      currentOutputType = 'image';
    }
    
    // Check compatibility with next step's input requirements
    if (currentOutputType === 'image') {
      result.isValid = false;
      result.errors.push(
        `Step ${i + 1} (${currentPrompt.title}) outputs an image which cannot be used as input for Step ${i + 2} (${nextPrompt.title})`
      );
    }
  }
  
  return result;
};

/**
 * Check if a specific input mapping is valid based on source and target steps
 */
export const validateInputMapping = (
  sourcePrompt: Prompt | null,
  targetPrompt: Prompt,
  sourceType: 'user' | 'previousStep',
  targetInputId: string
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };
  
  // Get the target input field
  const targetField = targetPrompt.inputFields.find(field => field.id === targetInputId);
  
  if (!targetField) {
    result.isValid = false;
    result.errors.push(`Target input field "${targetInputId}" not found in prompt "${targetPrompt.title}"`);
    return result;
  }
  
  // If source is a previous step, validate compatibility
  if (sourceType === 'previousStep' && sourcePrompt) {
    // Determine output type of source prompt
    let sourceOutputType: 'text' | 'image' = 'text';
    if (sourcePrompt.outputType) {
      sourceOutputType = sourcePrompt.outputType;
    } else if (sourcePrompt.imageModel) {
      sourceOutputType = 'image';
    } else if (sourcePrompt.capabilities?.includes('image')) {
      sourceOutputType = 'image';
    }
    
    // Check if target input can accept the source output type
    if (sourceOutputType === 'image' && targetField.type !== 'image') {
      result.isValid = false;
      result.errors.push(
        `Cannot connect image output from "${sourcePrompt.title}" to text input "${targetField.label}" in "${targetPrompt.title}"`
      );
    }
  }
  
  return result;
};

/**
 * Calculate the total credit cost for a flow based on its steps
 */
export const calculateFlowCreditCost = (
  steps: FlowStep[],
  promptsMap: Record<string, Prompt>
): number => {
  return steps.reduce((total, step) => {
    const prompt = promptsMap[step.promptId];
    if (prompt) {
      return total + prompt.creditCost;
    }
    return total;
  }, 0);
};
