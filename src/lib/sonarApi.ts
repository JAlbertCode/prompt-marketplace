import { SonarApiRequest, SonarApiResponse, SonarModel } from '@/types';

// Use our local API route instead of calling Sonar directly
const SONAR_API_ENDPOINT = '/api/sonar';

/**
 * Executes a prompt using the Sonar API
 */
export async function executePrompt(
  systemPrompt: string,
  userInputs: Record<string, string>,
  model: SonarModel
): Promise<string> {
  // Format user inputs into a single string
  const userContent = Object.entries(userInputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Map model names to the correct format for the Perplexity API
  // Use simpler model names for compatibility
  const modelMap: Record<string, string> = {
    'sonar-small-online': 'sonar',
    'sonar-medium-chat': 'sonar',
    'sonar-large-online': 'sonar',
    'sonar-medium-online': 'sonar',
    'sonar-small-chat': 'sonar',
    'llama-3.1-sonar-small-128k-online': 'sonar'
  };

  const apiModel = modelMap[model] || 'sonar'; // Default to 'sonar' if model not found

  const request: SonarApiRequest = {
    model: apiModel,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ],
    max_tokens: 1024
  };

  try {
    const response = await fetch(SONAR_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sonar API Error: ${response.status} - ${errorText}`);
    }

    const data: SonarApiResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Sonar API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Sonar API:', error);
    throw error;
  }
}

/**
 * Generates a webhook URL for a prompt
 */
export function generateWebhookUrl(promptId: string): string {
  // In a production app, this would use the actual domain
  // For local development, we'll use a relative URL
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin
    : 'https://sonar-prompt-marketplace.vercel.app';
  
  return `${baseUrl}/api/webhook/${promptId}`;
}
