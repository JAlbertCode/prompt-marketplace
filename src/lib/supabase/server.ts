import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { cache } from 'react';

// Create a cached version of the Supabase client for server components
export const createSupabaseServerClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});

// Helper function to handle common query patterns for server components
export async function querySupabaseServer<T>(
  queryFn: (supabase: ReturnType<typeof createSupabaseServerClient>) => Promise<{ data: T | null; error: any }>,
  errorMsg = 'Database query failed'
): Promise<T> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await queryFn(supabase);
    
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

// Get the current authenticated user from the server
export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Get the user profile data from the database
export async function getUserProfile(userId: string) {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}
