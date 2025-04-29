/**
 * Utilities for managing sessions
 */

// Session storage key
const SESSION_ID_KEY = 'prompt-marketplace-session-id';
const SESSION_EXPIRY_KEY = 'prompt-marketplace-session-expiry';

// Session expiry time (1 day)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a random session ID
 * @returns A random session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get the current session ID or create a new one
 * @returns The session ID
 */
export function getOrCreateSessionId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  // Try to get existing session ID from localStorage
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  // If no session ID exists, or session has expired, create a new one
  if (!sessionId || !isValidSession()) {
    sessionId = generateSessionId();
    
    // Save new session ID and expiry time
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(
      SESSION_EXPIRY_KEY, 
      (Date.now() + SESSION_EXPIRY_MS).toString()
    );
  }
  
  return sessionId;
}

/**
 * Check if the current session is valid
 * @returns True if the session is valid, false otherwise
 */
export function isValidSession(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Get expiry time from localStorage
  const expiryTime = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  // If no expiry time exists, the session is invalid
  if (!expiryTime) {
    return false;
  }
  
  // Check if the session has expired
  const expiry = parseInt(expiryTime, 10);
  return Date.now() < expiry;
}

/**
 * Extend the current session
 */
export function extendSession(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Update the expiry time
  localStorage.setItem(
    SESSION_EXPIRY_KEY, 
    (Date.now() + SESSION_EXPIRY_MS).toString()
  );
}

/**
 * Clear the current session
 */
export function clearSession(): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Remove session data from localStorage
  localStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}
