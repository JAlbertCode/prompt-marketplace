import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a Supabase client for the browser
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Create a singleton instance
export const supabase = createSupabaseClient();

// Helper function to handle common query patterns
export async function querySupabase<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
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
