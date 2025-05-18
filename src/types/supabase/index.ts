export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          stripe_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          stripe_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          stripe_id?: string | null
          created_at?: string
        }
      }
      waitlist_users: {
        Row: {
          id: string
          email: string
          name: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          joined_at?: string
        }
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          remaining: number
          source: string
          stripe_payment_id: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          remaining: number
          source: string
          stripe_payment_id?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          remaining?: number
          source?: string
          stripe_payment_id?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      credit_burns: {
        Row: {
          id: string
          user_id: string
          prompt_id: string | null
          flow_id: string | null
          model_id: string
          length: string
          credits_used: number
          from_bucket_id: string
          creator_id: string | null
          creator_fee: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id?: string | null
          flow_id?: string | null
          model_id: string
          length: string
          credits_used: number
          from_bucket_id: string
          creator_id?: string | null
          creator_fee?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string | null
          flow_id?: string | null
          model_id?: string
          length?: string
          credits_used?: number
          from_bucket_id?: string
          creator_id?: string | null
          creator_fee?: number | null
          timestamp?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount_usd: number
          credits_granted: number
          bonus_credits: number
          stripe_txn_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_usd: number
          credits_granted: number
          bonus_credits: number
          stripe_txn_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_usd?: number
          credits_granted?: number
          bonus_credits?: number
          stripe_txn_id?: string
          created_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system_prompt: string
          input_schema: Json
          model_id: string
          creator_fee: number
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system_prompt: string
          input_schema?: Json
          model_id: string
          creator_fee?: number
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          input_schema?: Json
          model_id?: string
          creator_fee?: number
          is_public?: boolean
          created_at?: string
        }
      }
      flows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          price?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          price?: number
          created_at?: string
        }
      }
      flow_steps: {
        Row: {
          id: string
          flow_id: string
          prompt_id: string
          step_order: number
          input_mapping: Json
        }
        Insert: {
          id?: string
          flow_id: string
          prompt_id: string
          step_order: number
          input_mapping?: Json
        }
        Update: {
          id?: string
          flow_id?: string
          prompt_id?: string
          step_order?: number
          input_mapping?: Json
        }
      }
      models: {
        Row: {
          id: string
          provider: string
          cost_short: number
          cost_medium: number
          cost_long: number
        }
        Insert: {
          id: string
          provider: string
          cost_short: number
          cost_medium: number
          cost_long: number
        }
        Update: {
          id?: string
          provider?: string
          cost_short?: number
          cost_medium?: number
          cost_long?: number
        }
      }
      payouts: {
        Row: {
          id: string
          creator_id: string
          credits_earned: number
          usd_equivalent: number
          source_type: string
          source_id: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          credits_earned: number
          usd_equivalent: number
          source_type: string
          source_id: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          credits_earned?: number
          usd_equivalent?: number
          source_type?: string
          source_id?: string
          created_at?: string
        }
      }
      automation_webhooks: {
        Row: {
          id: string
          user_id: string
          flow_id: string
          monthly_credit_burn: number
          last_triggered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          flow_id: string
          monthly_credit_burn?: number
          last_triggered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          flow_id?: string
          monthly_credit_burn?: number
          last_triggered_at?: string
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
