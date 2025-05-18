import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for the browser
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper function to handle common query patterns
export async function querySupabase<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>, 
  errorMsg = 'Database query failed'
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error(`${errorMsg}:`, error);
      throw new Error(`${errorMsg}: ${error.message}`);
    }
    
    if (data === null) {
      throw new Error(`${errorMsg}: No data returned`);
    }
    
    return data;
  } catch (error) {
    console.error(`${errorMsg}:`, error);
    throw error;
  }
}

// Helper to create a service role client (for admin operations)
export function createServiceRoleClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role environment variables');
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
}

// Get the current user from Supabase auth
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  return user;
}
