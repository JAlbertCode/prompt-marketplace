// src/lib/auth/authHelpers.ts
'use client';

/**
 * Gets a cookie by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

/**
 * Sets the authentication status in cookies for both client and server use
 * @param value Authentication status (true/false)
 */
export const setAuthenticated = (value: boolean): void => {
  // Use the name 'auth' to match what middleware checks for
  if (typeof window !== 'undefined') {
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
  // Client-side check using cookies
  if (typeof window !== 'undefined') {
    return getCookie('auth') === 'true';
  }
  
  // Server-side check (less common)
  return false;
};

/**
 * Logs the user out by clearing auth state
 */
export const logout = (): void => {
  // Expire the auth cookie
  if (typeof window !== 'undefined') {
    document.cookie = 'auth=false; path=/; max-age=0';
  }
};
