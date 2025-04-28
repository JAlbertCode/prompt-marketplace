/**
 * Utilities for sharing prompt responses
 */

// Base URL for sharing
const BASE_SHARE_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/shared`
  : '';

/**
 * Generate a shareable URL for a prompt response
 * @param promptId The ID of the prompt
 * @param response The response text or content
 * @param promptTitle The title of the prompt
 * @returns A shareable URL
 */
export function generateShareUrl(
  promptId: string,
  response: string,
  promptTitle: string
): string {
  // For the MVP, we'll just use URL parameters
  // In a production app, we would store the response in a database
  // and generate a shorter URL with a unique ID
  
  // Create URL parameters
  const params = new URLSearchParams();
  params.set('id', promptId);
  params.set('title', promptTitle);
  
  // Compress the response to keep the URL shorter
  // For the MVP, we'll just encode the response
  // In production, we would use a more sophisticated compression
  // or store the response on the server
  params.set('resp', encodeURIComponent(response));
  
  return `${BASE_SHARE_URL}?${params.toString()}`;
}

/**
 * Copy a URL to the clipboard
 * @param url The URL to copy
 * @returns A promise that resolves when the copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share a prompt response using the Web Share API if available
 * Falls back to copying to clipboard if Web Share API is not available
 * @param title The title to share
 * @param text The text to share
 * @param url The URL to share
 * @returns A promise that resolves to true if sharing was successful
 */
export async function shareResponse(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error) {
      // User cancelled or share failed
      console.error('Error sharing:', error);
      return false;
    }
  }
  
  // Fall back to copying the URL to clipboard
  return copyToClipboard(url);
}

/**
 * Parse a shared response from URL parameters
 * @param params URLSearchParams object
 * @returns The parsed response data
 */
export function parseSharedResponse(params: URLSearchParams): {
  promptId: string;
  promptTitle: string;
  response: string;
} | null {
  const promptId = params.get('id');
  const promptTitle = params.get('title');
  const encodedResponse = params.get('resp');
  
  if (!promptId || !promptTitle || !encodedResponse) {
    return null;
  }
  
  try {
    const response = decodeURIComponent(encodedResponse);
    return {
      promptId,
      promptTitle,
      response
    };
  } catch (error) {
    console.error('Error parsing shared response:', error);
    return null;
  }
}
