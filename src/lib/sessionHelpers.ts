/**
 * Utilities for managing secure user sessions
 * Used to prevent credit refresh exploits
 */

import { v4 as uuidv4 } from 'uuid';

// Session identifier key in localStorage
const SESSION_ID_KEY = 'promptflow-session-id';
const SESSION_TIMESTAMP_KEY = 'promptflow-session-timestamp';

/**
 * Get or create a unique session ID
 * This helps prevent users from simply refreshing to reset credits
 */
export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Try to get existing session ID
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Create new session ID if none exists
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    
    // Set session creation timestamp
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  }
  
  return sessionId;
};

/**
 * Check if the current session is valid
 * Helps prevent tampering with localStorage
 */
export const isValidSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const sessionId = localStorage.getItem(SESSION_ID_KEY);
  const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  
  // Session is invalid if either value is missing
  if (!sessionId || !timestamp) return false;
  
  // Additional validation could be added here
  // For example, checking if the timestamp is within a reasonable range
  
  return true;
};

/**
 * Reset the session (used for testing or when needed)
 */
export const resetSession = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);
};

/**
 * Get the session timestamp
 */
export const getSessionTimestamp = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
};
