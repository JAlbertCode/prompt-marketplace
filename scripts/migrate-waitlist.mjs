/**
 * Migration script to move waitlist entries from local JSON to Supabase
 * 
 * This script reads the waitlist.json file and migrates all entries to the
 * Supabase waitlist_users table.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Path to waitlist storage file
const waitlistFilePath = path.join(process.cwd(), 'src', 'data', 'waitlist.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to get all waitlist entries from JSON file
function getLocalWaitlistEntries() {
  try {
    if (!fs.existsSync(waitlistFilePath)) {
      console.log('Waitlist file does not exist. No entries to migrate.');
      return [];
    }
    
    const rawData = fs.readFileSync(waitlistFilePath, 'utf8');
    const data = JSON.parse(rawData);
    return data.emails || [];
  } catch (error) {
    console.error('Error reading waitlist file:', error);
    return [];
  }
}

// Function to check if email exists in Supabase
async function emailExistsInSupabase(email) {
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

// Function to add entry to Supabase
async function addToSupabase(entry) {
  try {
    const { error } = await supabase
      .from('waitlist_users')
      .insert({
        id: uuidv4(),
        email: entry.email,
        name: entry.firstName ? 
          (entry.lastName ? `${entry.firstName} ${entry.lastName}` : entry.firstName) 
          : null,
        joined_at: entry.joinedAt || new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error adding ${entry.email} to Supabase:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding ${entry.email} to Supabase:`, error);
    return false;
  }
}

// Main migration function
async function migrateWaitlist() {
  console.log('Starting waitlist migration to Supabase...');
  
  // Get local entries
  const entries = getLocalWaitlistEntries();
  console.log(`Found ${entries.length} entries in local waitlist file.`);
  
  if (entries.length === 0) {
    console.log('No entries to migrate.');
    return;
  }
  
  // Counters
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  
  // Process each entry
  for (const entry of entries) {
    try {
      // Check if email already exists in Supabase
      const exists = await emailExistsInSupabase(entry.email);
      
      if (exists) {
        console.log(`Skipping ${entry.email} - already exists in Supabase`);
        skipped++;
        continue;
      }
      
      // Add to Supabase
      const result = await addToSupabase(entry);
      
      if (result) {
        console.log(`Migrated ${entry.email} to Supabase`);
        migrated++;
      } else {
        console.log(`Failed to migrate ${entry.email}`);
        failed++;
      }
    } catch (error) {
      console.error(`Error processing entry ${entry.email}:`, error);
      failed++;
    }
  }
  
  // Summary
  console.log('\nMigration Summary:');
  console.log(`Total entries: ${entries.length}`);
  console.log(`Successfully migrated: ${migrated}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nWarning: Some entries failed to migrate. Check the logs for details.');
  } else {
    console.log('\nWaitlist migration completed successfully!');
  }
}

// Run the migration
migrateWaitlist()
  .then(() => {
    console.log('Migration process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
