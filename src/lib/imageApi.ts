/**
 * Utilities for interacting with OpenAI's DALL-E image generation API
 */

import { ImageModel } from '@/types';

// Base URL for OpenAI API
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';

/**
 * Generate an image using OpenAI's DALL-E API
 * @param prompt The prompt to generate an image from
 * @param model The model to use for generation
 * @param options Additional options for image generation
 * @returns A promise resolving to the generated image URL
 */
export async function generateImage(
  prompt: string,
  model: 'dall-e-2' | 'dall-e-3' = 'dall-e-3',
  options: {
    size?: string;
    quality?: string;
    style?: string;
    numberOfImages?: number;
  } = {}
): Promise<string> {
  try {
    // Call our proxy API endpoint
    const response = await fetch('/api/openai/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        n: options.numberOfImages || 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }
    
    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image with DALL-E API:', error);
    throw error;
  }
}

/**
 * Calculate credit cost for image generation
 * @param model The model used for generation
 * @param options Additional options that might affect pricing
 * @returns The credit cost for the operation
 */
export function calculateImageCreditCost(
  model: 'dall-e-2' | 'dall-e-3',
  options: { size?: string; quality?: string } = {}
): number {
  // Credit costs based on model, size, and quality
  if (model === 'dall-e-3') {
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    
    if (quality === 'hd') {
      // HD images cost more
      if (size === '1024x1024') return 200;
      if (size === '1792x1024' || size === '1024x1792') return 300;
      return 250; // Default
    } else {
      // Standard quality
      if (size === '1024x1024') return 100;
      if (size === '1792x1024' || size === '1024x1792') return 200;
      return 150; // Default
    }
  } else {
    // DALL-E 2 costs less
    return 50;
  }
}

/**
 * Map internal model names to API model names
 */
export function mapModelToApiModel(model: ImageModel): 'dall-e-2' | 'dall-e-3' {
  const modelMap: Record<ImageModel, 'dall-e-2' | 'dall-e-3'> = {
    'dall-e-3': 'dall-e-3',
    'dall-e-2': 'dall-e-2',
    'stable-diffusion-xl': 'dall-e-3', // Fallback mappings
    'stability-xl-turbo': 'dall-e-3',
    'stability-xl-ultra': 'dall-e-3',
    'sdxl': 'dall-e-3',
    'sd3': 'dall-e-3',
  };
  
  return modelMap[model] || 'dall-e-3';
}