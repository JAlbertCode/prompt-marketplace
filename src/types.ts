/**
 * Types for PromptFlow application
 */

// User profile information
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: Date;
  isCreator: boolean;
  credits?: Credit[];
}

// Credit bucket for user
export interface Credit {
  id: string;
  userId: string;
  amount: number;
  remaining: number;
  type: CreditType;
  source: CreditSource;
  expiresAt?: Date;
  createdAt: Date;
}

// Credit types (determines burn priority)
export type CreditType = 'purchased' | 'bonus' | 'referral';

// Credit source (for tracking)
export type CreditSource = 
  'purchase' | 
  'signup_bonus' | 
  'referral' | 
  'creator_earnings' | 
  'automation_bonus' | 
  'promo_code';

// Prompt model
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  model: string;
  tags?: string[];
  visibility: 'private' | 'public' | 'unlisted';
  creatorId: string;
  creatorName?: string;
  createdAt: Date;
  updatedAt?: Date;
  runCount?: number;
  avgRating?: number;
  price?: number;
  creatorFee?: number;
}

// Prompt flow (chain of prompts)
export interface PromptFlow {
  id: string;
  title: string;
  description: string;
  steps: PromptFlowStep[];
  creatorId: string;
  creatorName?: string;
  visibility: 'private' | 'public' | 'unlisted';
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  runCount?: number;
  price?: number;
  blueprint?: FlowBlueprint;
}

// Individual step in a flow
export interface PromptFlowStep {
  id?: string;
  promptId?: string;
  promptContent?: string;
  model: string;
  inputType: string;
  outputType: string;
  order: number;
  mapping?: StepMapping[];
}

// Input/output mapping between steps
export interface StepMapping {
  from: string;
  to: string;
}

// Blueprint for exporting flows
export interface FlowBlueprint {
  id: string;
  flowId: string;
  format: 'n8n' | 'zapier' | 'make' | 'json';
  config: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  price?: number;
}

// Transaction record
export interface Transaction {
  id: string;
  userId: string;
  type: 'credit_purchase' | 'prompt_run' | 'flow_run' | 'prompt_unlock' | 'blueprint_purchase';
  amount: number;
  creditsBurned: number;
  reference: string;
  metadata: Record<string, any>;
  createdAt: Date;
}
