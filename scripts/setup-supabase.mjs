/**
 * Supabase Setup Script for PromptFlow
 * 
 * This script creates the necessary tables in Supabase based on the schema
 * defined in the README.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Starting Supabase database setup...');

    // Create users table
    const { error: usersError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'users',
      definition: `
        id UUID PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        stripe_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created or already exists');
    }

    // Create waitlist_users table
    const { error: waitlistError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'waitlist_users',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        joined_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (waitlistError) {
      console.error('Error creating waitlist_users table:', waitlistError);
    } else {
      console.log('✅ Waitlist_users table created or already exists');
    }

    // Create credit_ledger table
    const { error: creditLedgerError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'credit_ledger',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        amount BIGINT NOT NULL,
        remaining BIGINT NOT NULL,
        source TEXT CHECK (source IN ('purchased', 'bonus', 'referral')),
        stripe_payment_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      `
    });

    if (creditLedgerError) {
      console.error('Error creating credit_ledger table:', creditLedgerError);
    } else {
      console.log('✅ Credit_ledger table created or already exists');
    }

    // Create credit_burns table
    const { error: creditBurnsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'credit_burns',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        prompt_id UUID,
        flow_id UUID,
        model_id TEXT,
        length TEXT CHECK (length IN ('short', 'medium', 'long')),
        credits_used BIGINT,
        from_bucket_id UUID REFERENCES credit_ledger(id),
        creator_id UUID,
        creator_fee BIGINT,
        timestamp TIMESTAMP DEFAULT NOW()
      `
    });

    if (creditBurnsError) {
      console.error('Error creating credit_burns table:', creditBurnsError);
    } else {
      console.log('✅ Credit_burns table created or already exists');
    }

    // Create payments table
    const { error: paymentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'payments',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        amount_usd NUMERIC,
        credits_granted BIGINT,
        bonus_credits BIGINT,
        stripe_txn_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (paymentsError) {
      console.error('Error creating payments table:', paymentsError);
    } else {
      console.log('✅ Payments table created or already exists');
    }

    // Create prompts table
    const { error: promptsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'prompts',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        name TEXT,
        description TEXT,
        system_prompt TEXT,
        input_schema JSONB,
        model_id TEXT,
        creator_fee BIGINT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (promptsError) {
      console.error('Error creating prompts table:', promptsError);
    } else {
      console.log('✅ Prompts table created or already exists');
    }

    // Create flows table
    const { error: flowsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'flows',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        name TEXT,
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        price BIGINT,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (flowsError) {
      console.error('Error creating flows table:', flowsError);
    } else {
      console.log('✅ Flows table created or already exists');
    }

    // Create flow_steps table
    const { error: flowStepsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'flow_steps',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        flow_id UUID REFERENCES flows(id),
        prompt_id UUID REFERENCES prompts(id),
        step_order INT,
        input_mapping JSONB
      `
    });

    if (flowStepsError) {
      console.error('Error creating flow_steps table:', flowStepsError);
    } else {
      console.log('✅ Flow_steps table created or already exists');
    }

    // Create models table
    const { error: modelsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'models',
      definition: `
        id TEXT PRIMARY KEY,
        provider TEXT,
        cost_short BIGINT,
        cost_medium BIGINT,
        cost_long BIGINT
      `
    });

    if (modelsError) {
      console.error('Error creating models table:', modelsError);
    } else {
      console.log('✅ Models table created or already exists');
    }

    // Create payouts table
    const { error: payoutsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'payouts',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        creator_id UUID REFERENCES users(id),
        credits_earned BIGINT,
        usd_equivalent NUMERIC,
        source_type TEXT CHECK (source_type IN ('prompt', 'flow')),
        source_id UUID,
        created_at TIMESTAMP DEFAULT NOW()
      `
    });

    if (payoutsError) {
      console.error('Error creating payouts table:', payoutsError);
    } else {
      console.log('✅ Payouts table created or already exists');
    }

    // Create automation_webhooks table
    const { error: automationWebhooksError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'automation_webhooks',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        flow_id UUID REFERENCES flows(id),
        monthly_credit_burn BIGINT,
        last_triggered_at TIMESTAMP
      `
    });

    if (automationWebhooksError) {
      console.error('Error creating automation_webhooks table:', automationWebhooksError);
    } else {
      console.log('✅ Automation_webhooks table created or already exists');
    }

    console.log('Supabase database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Execute the setup
setupDatabase();
