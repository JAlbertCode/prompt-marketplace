/**
 * Debug utilities for development and troubleshooting
 */

/**
 * Dump the current content of localStorage to console
 * Used for debugging persistence issues
 */
export function debugLocalStorage() {
  if (typeof window === 'undefined') {
    console.log('⚠️ Cannot access localStorage in SSR context');
    return;
  }
  
  try {
    console.group('🔍 LocalStorage Debug Dump');
    
    // Get all keys
    const keys = Object.keys(localStorage);
    console.log(`LocalStorage has ${keys.length} keys`);
    
    // Log each store
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value) {
          console.log(`${key}: <empty>`);
          return;
        }
        
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(value);
          console.log(`${key}: `, parsed);
        } catch {
          // Not JSON, show as string with length
          console.log(`${key}: String of length ${value.length}`);
        }
      } catch (err) {
        console.error(`Error accessing key "${key}":`, err);
      }
    });
    
    console.groupEnd();
  } catch (error) {
    console.error('Failed to debug localStorage:', error);
  }
}

/**
 * Check prompt store specifically
 */
export function debugPromptStore() {
  if (typeof window === 'undefined') {
    console.log('⚠️ Cannot access localStorage in SSR context');
    return;
  }
  
  try {
    const promptStorage = localStorage.getItem('prompt-storage');
    if (!promptStorage) {
      console.log('❌ No prompt storage found');
      return;
    }
    
    const data = JSON.parse(promptStorage);
    const prompts = data?.state?.prompts || [];
    
    console.log(`🔍 Found ${prompts.length} prompts in storage`);
    if (prompts.length > 0) {
      console.log('First prompt:', prompts[0]);
    }
  } catch (error) {
    console.error('Failed to debug prompt store:', error);
  }
}
