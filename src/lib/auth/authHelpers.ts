// src/lib/auth/authHelpers.ts
'use client';


/**
 * Sets the authentication status in both localStorage (client-side) and cookies (for middleware)
 * @param value Authentication status (true/false)
 */
export const setAuthenticated = (value: boolean): void => {
  // Client-side storage
  if (typeof window !== 'undefined') {
    localStorage.setItem('isAuthenticated', value ? 'true' : 'false');
    
    // Also set in a cookie for middleware to access
    // Use the name 'auth' to match what middleware checks for
    document.cookie = `auth=${value ? 'true' : 'false'}; path=/; max-age=${
      value ? 30 * 24 * 60 * 60 : 0
    }`;
  }
};

/**
 * Checks if the user is authenticated
 * @returns Authentication status
 */
export const isAuthenticated = (): boolean => {
  // Client-side check
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
  
  // Server-side check (less common)
  return false;
};

/**
 * Logs the user out by clearing auth state
 */
export const logout = (): void => {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isAuthenticated');
    
    // Expire the auth cookie
    document.cookie = 'auth=false; path=/; max-age=0';
  }
};
