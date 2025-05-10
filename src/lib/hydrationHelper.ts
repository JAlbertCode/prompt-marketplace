/**
 * Hydration Helpers
 * 
 * Utilities to help with store hydration and refresh in Zustand
 */

/**
 * Force reload data from localStorage for a specific store
 * Useful for refreshing data when it may be out of sync
 * 
 * @param storeName The name of the store in localStorage
 * @returns true if store was found and reloaded, false otherwise
 */
export function forceReloadStore(storeName: string): boolean {
  if (typeof window === 'undefined') {
    return false; // Not in browser environment
  }
  
  try {
    // Get the store data from localStorage
    const data = localStorage.getItem(storeName);
    
    if (data) {
      // Re-save the data to trigger watchers and force a refresh
      localStorage.setItem(storeName, data);
      
      // Also dispatch a custom event to notify listeners
      window.dispatchEvent(new CustomEvent('storage-update', { 
        detail: { store: storeName } 
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error reloading store "${storeName}":`, error);
    return false;
  }
}

/**
 * Clear a specific store from localStorage and memory
 * 
 * @param storeName The name of the store in localStorage
 * @returns true if store was found and cleared, false otherwise
 */
export function clearStore(storeName: string): boolean {
  if (typeof window === 'undefined') {
    return false; // Not in browser environment
  }
  
  try {
    // Check if the store exists
    if (localStorage.getItem(storeName)) {
      // Remove the store from localStorage
      localStorage.removeItem(storeName);
      
      // Dispatch event to notify listeners
      window.dispatchEvent(new CustomEvent('storage-clear', { 
        detail: { store: storeName } 
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error clearing store "${storeName}":`, error);
    return false;
  }
}
