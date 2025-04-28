/**
 * Utilities for interacting with the Stability AI API
 */

import { ImageModel, StabilityApiRequest, StabilityApiResponse } from '@/types';

// Base URL for Stability API
const STABILITY_API_BASE_URL = 'https://api.stability.ai/v1';

/**
 * Generate an image using the Stability AI API
 * @param prompt The prompt to generate an image from
 * @param model The model to use for generation
 * @param options Additional options for image generation
 * @returns A promise resolving to the generated image URL
 */
export async function generateImage(
  prompt: string,
  model: ImageModel = 'stable-diffusion-xl',
  options: {
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
    seed?: number;
  } = {}
): Promise<string> {
  try {
    // Call our backend API endpoint
    const response = await fetch('/api/stability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        model,
        negative_prompt: options.negativePrompt,
        width: options.width || 1024,
        height: options.height || 1024,
        steps: options.steps || 30,
        cfg_scale: options.cfgScale || 7,
        seed: options.seed
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }
    
    const data = await response.json();
    return data.images[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
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
  model: ImageModel,
  options: { width?: number; height?: number; steps?: number } = {}
): number {
  // Base costs for different models
  const baseCosts: Record<ImageModel, number> = {
    'stable-diffusion-xl': 150,
    'stability-xl-turbo': 100,
    'stability-xl-ultra': 300,
    'sdxl': 150,
    'sd3-large': 250,
  };
  
  // Get base cost for the selected model
  const baseCost = baseCosts[model] || 150;
  
  // Calculate resolution multiplier
  // Higher resolutions cost more
  const width = options.width || 1024;
  const height = options.height || 1024;
  const pixels = width * height;
  const standardPixels = 1024 * 1024;
  const resolutionMultiplier = Math.max(1, Math.min(2, pixels / standardPixels));
  
  // Calculate steps multiplier
  // More steps cost more
  const steps = options.steps || 30;
  const stepsMultiplier = Math.max(1, steps / 30);
  
  // Calculate final cost
  const finalCost = Math.round(baseCost * resolutionMultiplier * stepsMultiplier);
  
  return finalCost;
}

/**
 * Check if a model supports a particular capability
 * @param model The model to check
 * @param capability The capability to check for
 * @returns Whether the model supports the capability
 */
export function modelSupportsCapability(
  model: ImageModel | string,
  capability: 'image' | 'animation' | 'upscaling'
): boolean {
  // Map models to their capabilities
  const capabilities: Record<string, string[]> = {
    'stable-diffusion-xl': ['image', 'upscaling'],
    'stability-xl-turbo': ['image'],
    'stability-xl-ultra': ['image', 'upscaling'],
    'sdxl': ['image', 'upscaling'],
    'sd3-large': ['image', 'upscaling', 'animation'],
  };
  
  // Return whether the model supports the capability
  return capabilities[model]?.includes(capability) || false;
}
