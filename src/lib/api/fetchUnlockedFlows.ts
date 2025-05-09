import { useUnlockedFlowStore } from '@/store/useUnlockedFlowStore';

/**
 * Fetches the user's unlocked flows from the server and syncs with the client store
 */
export async function fetchUnlockedFlows() {
  try {
    const response = await fetch('/api/user/unlocked-flows');
    
    if (!response.ok) {
      throw new Error('Failed to fetch unlocked flows');
    }
    
    const data = await response.json();
    
    if (data.unlockedFlows && Array.isArray(data.unlockedFlows)) {
      // Update the store with the server data
      useUnlockedFlowStore.getState().setUnlockedFlows(data.unlockedFlows);
      return data.unlockedFlows;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching unlocked flows:', error);
    return [];
  }
}
