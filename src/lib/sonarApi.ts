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

  const request: SonarApiRequest = {
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userContent
      }
    ]
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
 * Generates a dummy webhook URL for a prompt
 */
export function generateWebhookUrl(promptId: string): string {
  return `https://api.sonar-prompts.com/run/${promptId}`;
}
