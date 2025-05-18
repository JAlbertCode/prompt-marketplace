import { supabase, createServiceRoleClient } from './supabase';

/**
 * Sign up a new user
 */
export async function signUpUser(email: string, password: string, name?: string) {
  try {
    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) {
      console.error('Error signing up:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned after signup');
    }

    // Create a record in the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name: name || null
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError;
    }

    // Add 100,000 welcome bonus credits
    const { error: creditError } = await supabase
      .from('credit_ledger')
      .insert({
        user_id: authData.user.id,
        amount: 100_000,
        remaining: 100_000,
        source: 'bonus'
      });

    if (creditError) {
      console.error('Error adding welcome credits:', creditError);
      throw creditError;
    }

    return authData.user;
  } catch (error) {
    console.error('Error in signup process:', error);
    throw error;
  }
}

/**
 * Sign in a user
 */
export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign in with OAuth (Google, GitHub)
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Reset password request
 */
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: { name?: string }) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // Also update the auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: updates.name }
    });

    if (authError) {
      console.error('Error updating auth user data:', authError);
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Admin function: Get all users (requires service role key)
 */
export async function getAllUsers(page = 1, pageSize = 50) {
  try {
    const adminClient = createServiceRoleClient();
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;
    
    const { data, error } = await adminClient
      .from('users')
      .select('*')
      .range(startIndex, endIndex);
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}
