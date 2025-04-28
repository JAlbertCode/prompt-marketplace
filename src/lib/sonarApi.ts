/**
 * Utilities for interacting with the Sonar API
 */

import { SonarMessage, SonarModel } from '@/types';

/**
 * Execute a prompt using the Sonar API
 * @param systemPrompt The system prompt to use
 * @param userInputs The user inputs to include
 * @param model The Sonar model to use
 * @returns A promise resolving to the generated text
 */
export async function executePrompt(
  systemPrompt: string,
  userInputs: Record<string, string>,
  model: SonarModel = 'sonar'
): Promise<string> {
  try {
    // Format user inputs into a string
    const userContent = Object.entries(userInputs)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n\n');
    
    // Create message array
    const messages: SonarMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ];
    
    // Make API request through our proxy
    const response = await fetch('/api/sonar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute prompt');
    }
    
    const data = await response.json();
    
    // Extract the generated text
    const generatedText = data.choices[0]?.message?.content || '';
    
    return generatedText;
  } catch (error) {
    console.error('Error executing prompt:', error);
    throw error;
  }
}

/**
 * Calculate the token count for a message (approximate)
 * @param text The text to count tokens for
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Map internal model names to API model names
 */
export function mapModelToApiModel(model: SonarModel): string {
  // As of April 2025, 'sonar' is the standard model name
  // All other model names map to 'sonar' for compatibility with older prompts
  return 'sonar';
}

/**
 * Generates a webhook URL for a prompt
 * @param promptId The ID of the prompt
 * @returns A webhook URL string
 */
export const generateWebhookUrl = (promptId: string): string => {
  return `https://api.sonar-prompts.com/run/${promptId}`;
};
