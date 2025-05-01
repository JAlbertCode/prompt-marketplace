/**
 * Utilities for interacting with OpenAI's GPT-4o API
 */

import { GPTModel } from '@/types';

// Base URL for OpenAI API
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

/**
 * Transform an image using GPT-4o or GPT-Image-1
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
    
    // Determine which endpoint to use based on the model
    let endpoint = '/api/openai/transform';
    
    // Use the dedicated transform2 endpoint for gpt-image-1
    if (model === 'gpt-image-1') {
      endpoint = '/api/openai/transform2';
      console.log('Using gpt-image-1 for direct image-to-image transformation');
    } else {
      // Make sure we're using a supported model for the regular transform endpoint
      const supportedModels: GPTModel[] = ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-4-vision-preview'];
      model = supportedModels.includes(model) ? model : 'gpt-4o';
    }
    
    console.log(`Sending transformation request with model: ${model}`);
    console.log(`Prompt: ${promptText}`);
    
    // For gpt-image-1, we need to use FormData for the file upload
    if (model === 'gpt-image-1') {
      // Create a file from the base64 string
      const byteCharacters = atob(imageBase64);
      const byteArrays = [];
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      const byteArray = new Uint8Array(byteArrays);
      const imageFile = new File([byteArray], 'image.jpg', { type: 'image/jpeg' });
      
      // Create form data
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('style', promptText);
      
      // Call the transform2 endpoint with form data
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transform image with gpt-image-1');
      }
      
      const data = await response.json();
      return data.imageUrl;
    }
    
    // For other models, use the regular JSON-based API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
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
      return 180; // Lower cost for direct transformation
    case 'gpt-4-turbo':
      return 150;
    case 'gpt-4o-mini':
      return 100;
    default:
      return 200; // Default cost
  }
}