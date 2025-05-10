/**
 * Helper functions for dealing with hydration and state management
 */

/**
 * Fetch fresh data from the API
 *
 * @param endpoint API endpoint to fetch from
 * @returns Promise with the data
 */
export async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from API (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Check if the API endpoint is available
 *
 * @param endpoint API endpoint to check
 * @returns Boolean indicating if the endpoint is available
 */
export async function checkApiEndpoint(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/${endpoint}`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`Failed to check API endpoint (${endpoint}):`, error);
    return false;
  }
}
