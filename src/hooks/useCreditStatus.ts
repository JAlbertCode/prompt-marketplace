'use client';

import { useState, useEffect } from 'react';
import { getUserCredits } from '@/utils/creditManager';

// This is a simplified mock of authentication
// In a real app, this would come from your auth context/provider
const getCurrentUserId = () => {
  // This is just a placeholder - in a real app, get the actual user ID from auth
  return 'user_123';
};

interface UseCreditStatusOptions {
  refreshInterval?: number; // in milliseconds
  initialFetch?: boolean;
}

interface UseCreditStatusResult {
  credits: number;
  loading: boolean;
  error: Error | null;
  refreshCredits: () => Promise<void>;
  hasEnoughCredits: (amount: number) => boolean;
}

/**
 * Hook to track and manage user credit status
 */
export default function useCreditStatus(options: UseCreditStatusOptions = {}): UseCreditStatusResult {
  const { 
    refreshInterval = 60000, // Default: refresh every minute
    initialFetch = true,
  } = options;
  
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(initialFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();
      const userCredits = await getUserCredits(userId);
      setCredits(userCredits);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
      console.error('Error fetching credits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (initialFetch) {
      fetchCredits();
    }
  }, [initialFetch]);

  // Set up periodic refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchCredits, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  const hasEnoughCredits = (amount: number): boolean => {
    return credits >= amount;
  };

  return {
    credits,
    loading,
    error,
    refreshCredits: fetchCredits,
    hasEnoughCredits,
  };
}
