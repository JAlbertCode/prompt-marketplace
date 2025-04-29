/**
 * Utilities for interacting with OpenAI's GPT-4o API
 */

import { GPTModel } from '@/types';

// Base URL for OpenAI API
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

/**
 * Transform an image using GPT-4o
 * @param imageBase64 The base64-encoded image to transform
 * @param promptText The text prompt describing the transformation
 * @param model The model to use (default: gpt-4o)
 * @returns A promise resolving to the URL of the transformed image
 */
export async function transformImage(
  imageBase64: string,
  promptText: string,
  model: GPTModel = 'gpt-4o'
): Promise<string> {
  try {
    // Validate inputs before sending request
    if (!imageBase64) {
      throw new Error('No image data provided');
    }
    
    if (!promptText || promptText.trim().length < 5) {
      throw new Error('Prompt text is too short or empty');
    }
    
    // Make sure we're using a supported model
    const supportedModels: GPTModel[] = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-4-vision-preview'];
    const modelToUse = supportedModels.includes(model) ? model : 'gpt-4o';
    
    console.log(`Sending transformation request with model: ${modelToUse}`);
    console.log(`Prompt: ${promptText}`);
    
    // Call our proxy API endpoint
    const response = await fetch('/api/openai/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        image: imageBase64,
        prompt: promptText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transform API error response:', errorData);
      throw new Error(errorData.error || 'Failed to transform image');
    }
    
    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error('No image URL returned from transformation API');
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('Error transforming image with GPT-4o API:', error);
    throw error;
  }
}

/**
 * Calculate credit cost for image transformation
 * @param model The model used for transformation
 * @returns The credit cost for the operation
 */
export function calculateTransformationCreditCost(
  model: GPTModel
): number {
  // Credit costs based on model
  switch (model) {
    case 'gpt-4o':
      return 200;
    case 'gpt-image-1':
      return 250;
    case 'gpt-4-turbo':
      return 150;
    case 'gpt-4o-mini':
      return 100;
    default:
      return 200; // Default cost
  }
}