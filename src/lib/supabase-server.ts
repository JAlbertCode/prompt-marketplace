import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Create a Supabase client specifically for server components and API routes
 * that properly awaits cookie operations
 */
export async function createServerSafeSupabaseClient() {
  // Environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Validation
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Create client with default options
  const client = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': '@prompt-flow/server-component',
        },
      },
    }
  );
  
  // This client doesn't try to read cookies, since that's causing issues
  // It's primarily used for admin operations
  
  return client;
}
