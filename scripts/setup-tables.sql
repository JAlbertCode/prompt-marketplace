-- PromptFlow Supabase Tables
-- Run this SQL in your Supabase SQL Editor if the setup script doesn't work

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  stripe_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Waitlist users table
CREATE TABLE IF NOT EXISTS waitlist_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Credit ledger table
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount BIGINT NOT NULL,
  remaining BIGINT NOT NULL,
  source TEXT CHECK (source IN ('purchased', 'bonus', 'referral')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Credit burns table
CREATE TABLE IF NOT EXISTS credit_burns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount_usd NUMERIC,
  credits_granted BIGINT,
  bonus_credits BIGINT,
  stripe_txn_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  system_prompt TEXT,
  input_schema JSONB,
  model_id TEXT,
  creator_fee BIGINT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flows table
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  price BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flow steps table
CREATE TABLE IF NOT EXISTS flow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id),
  prompt_id UUID REFERENCES prompts(id),
  step_order INT,
  input_mapping JSONB
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  provider TEXT,
  cost_short BIGINT,
  cost_medium BIGINT,
  cost_long BIGINT
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  credits_earned BIGINT,
  usd_equivalent NUMERIC,
  source_type TEXT CHECK (source_type IN ('prompt', 'flow')),
  source_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automation webhooks table
CREATE TABLE IF NOT EXISTS automation_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  flow_id UUID REFERENCES flows(id),
  monthly_credit_burn BIGINT,
  last_triggered_at TIMESTAMP
);
