/**
 * Utilities for interacting with Stability AI image generation API
 */

// Base URL for Stability API
const STABILITY_API_BASE_URL = 'https://api.stability.ai/v1';

/**
 * Generate an image using Stability AI API
 * @param prompt The prompt to generate an image from
 * @param model The model to use for generation
 * @param options Additional options for image generation
 * @returns A promise resolving to the generated image URL
 */
export async function generateImage(
  prompt: string,
  model: string = 'stable-diffusion-xl',
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
    // Call our proxy API endpoint
    const response = await fetch('/api/stability/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        negative_prompt: options.negativePrompt,
        width: options.width || 1024,
        height: options.height || 1024,
        steps: options.steps || 30,
        cfg_scale: options.cfgScale || 7,
        seed: options.seed || Math.floor(Math.random() * 2147483647),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }
    
    const data = await response.json();
    return data.images[0].url;
  } catch (error) {
    console.error('Error generating image with Stability API:', error);
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
  model: string,
  options: { width?: number; height?: number; steps?: number } = {}
): number {
  // Credit costs based on model and options
  switch (model) {
    case 'stable-diffusion-xl':
      return 80;
    case 'stability-xl-turbo':
      return 60;
    case 'stability-xl-ultra':
      return 120;
    default:
      return 80;
  }
}

/**
 * Map internal model names to API model names
 */
export function mapModelToApiModel(model: string): string {
  const modelMap: Record<string, string> = {
    'stable-diffusion-xl': 'stable-diffusion-xl',
    'stability-xl-turbo': 'stable-diffusion-xl-turbo',
    'stability-xl-ultra': 'stable-diffusion-xl-ultra',
    'sdxl': 'stable-diffusion-xl',
    'sd3': 'stable-diffusion-3',
  };
  
  return modelMap[model] || 'stable-diffusion-xl';
}