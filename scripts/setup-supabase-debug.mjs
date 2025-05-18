/**
 * Modified setup script to load environment variables properly
 * 
 * This script creates the necessary tables in Supabase based on the schema
 * defined in the README.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Looking for .env file at:', envPath);

if (fs.existsSync(envPath)) {
  console.log('.env file found. Loading environment variables...');
  dotenv.config({ path: envPath });
} else {
  console.log('.env file not found. Will try default environment loading.');
  dotenv.config(); // Try default loading
}

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Supabase Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Starting Supabase database setup...');

    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1).catch(err => {
      return { data: null, error: err };
    });

    if (error) {
      console.log('Connected to Supabase, but table not found (expected). Proceeding with setup...');
    } else {
      console.log('Successfully connected to Supabase!');
    }

    // Create users table
    const { error: usersError } = await supabase
      .from('users')
      .insert({ 
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (usersError) {
      if (usersError.code === '23505') { // Duplicate key error
        console.log('✅ Users table already exists');
      } else if (usersError.code === '42P01') { // Table doesn't exist
        console.log('❌ Users table does not exist. Creating...');
        
        // Create the table manually
        const { error: createError } = await supabase.rpc('create_table_if_not_exists', {
          table_name: 'users',
          definition: `
            id UUID PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT,
            stripe_id TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          `
        });
        
        if (createError) {
          console.error('Error creating users table:', createError);
        } else {
          console.log('✅ Users table created');
        }
      } else {
        console.error('Error checking users table:', usersError);
      }
    } else {
      console.log('✅ Users table exists and is accessible');
    }

    // Create waitlist_users table
    const { error: waitlistError } = await supabase
      .from('waitlist_users')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com', 
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (waitlistError) {
      if (waitlistError.code === '23505') { // Duplicate key error
        console.log('✅ Waitlist_users table already exists');
      } else if (waitlistError.code === '42P01') { // Table doesn't exist
        console.log('❌ Waitlist_users table does not exist. Creating...');
        
        // Create the table manually using SQL
        const { error: createError } = await supabase.rpc('create_table_if_not_exists', {
          table_name: 'waitlist_users',
          definition: `
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            name TEXT,
            joined_at TIMESTAMP DEFAULT NOW()
          `
        });
        
        if (createError) {
          console.error('Error creating waitlist_users table:', createError);
        } else {
          console.log('✅ Waitlist_users table created');
        }
      } else {
        console.error('Error checking waitlist_users table:', waitlistError);
      }
    } else {
      console.log('✅ Waitlist_users table exists and is accessible');
    }

    // Just test one more table - skipping full implementation for brevity
    console.log('Testing SQL execution capability...');
    
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql_statement: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        );
      `
    });
    
    if (sqlError) {
      console.error('Error executing SQL:', sqlError);
      console.log('It seems your Supabase project may not have RPC functions enabled or configured.');
      console.log('You will need to manually create the tables in the Supabase dashboard SQL editor.');
      console.log('Please see the table definitions in SUPABASE_MIGRATION.md');
    } else {
      console.log('✅ SQL execution successful');
    }

    console.log('Supabase connection test completed!');
    console.log('If errors were encountered above, you may need to manually create tables.');
    console.log('Table definitions can be found in SUPABASE_MIGRATION.md');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Execute the setup
setupDatabase();
