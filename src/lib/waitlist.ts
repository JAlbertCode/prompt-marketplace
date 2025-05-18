import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

interface WaitlistEntry {
  email: string;
  name?: string;
  joinedAt?: string;
  ipAddress?: string;
  source?: string;
}

/**
 * Get all waitlist entries
 * @returns Array of waitlist entries
 */
export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const { data, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .order('joined_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching waitlist entries:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting waitlist entries:', error);
    return [];
  }
}

/**
 * Check if an email already exists in the waitlist
 * @param email Email to check
 * @returns Boolean indicating if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('waitlist_users')
      .select('email')
      .ilike('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if email exists:', error);
    return false;
  }
}

/**
 * Add a new entry to the waitlist
 * @param entry Waitlist entry to add
 * @returns Boolean indicating success
 */
export async function addToWaitlist(entry: WaitlistEntry): Promise<boolean> {
  try {
    // Check if email already exists
    const exists = await emailExists(entry.email);
    if (exists) {
      return false;
    }
    
    // Add new entry
    const { error } = await supabase
      .from('waitlist_users')
      .insert({
        id: uuidv4(),
        email: entry.email,
        name: entry.name || null,
        joined_at: entry.joinedAt || new Date().toISOString()
      });
    
    if (error) {
      console.error('Error adding to waitlist:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return false;
  }
}