/**
 * Helper functions for dealing with hydration and state management
 */

/**
 * Force reload Zustand from localStorage to ensure prompt display
 * 
 * @param storeName Name of the localStorage key
 * @returns Boolean indicating if reload was successful
 */
export function forceReloadStore(storeName: string): boolean {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      console.warn('Attempted to reload store on server-side');
      return false;
    }
    
    // Get the current store data
    const storedData = localStorage.getItem(storeName);
    if (!storedData) {
      console.warn(`No data found for store: ${storeName}`);
      return false;
    }
    
    // Parse the store data
    const parsedData = JSON.parse(storedData);
    
    // Re-apply it to force a refresh
    localStorage.setItem(storeName, JSON.stringify(parsedData));
    
    return true;
  } catch (error) {
    console.error(`Failed to reload store ${storeName}:`, error);
    return false;
  }
}

/**
 * Check if a new entity was added to a store
 * 
 * @param storeName Name of the localStorage key
 * @param entityType Type of entity to check (e.g., 'prompts')
 * @param savedCount Known previous count of entities
 * @returns New count of entities or 0 if unavailable
 */
export function checkNewEntities(storeName: string, entityType: string, savedCount: number): number {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return 0;
    }
    
    // Get the current store data
    const storedData = localStorage.getItem(storeName);
    if (!storedData) {
      return 0;
    }
    
    // Parse the store data
    const parsedData = JSON.parse(storedData);
    
    // Check the entity count
    const currentCount = parsedData?.state?.[entityType]?.length || 0;
    
    // Log if there are new entities
    if (currentCount > savedCount) {
      console.log(`New ${entityType} detected: ${savedCount} → ${currentCount}`);
    }
    
    return currentCount;
  } catch (error) {
    console.error(`Failed to check ${entityType} count:`, error);
    return 0;
  }
}
