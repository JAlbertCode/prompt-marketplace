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
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          remaining: number
          source: 'purchase' | 'bonus' | 'referral'
          stripe_payment_id: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          remaining: number
          source: 'purchase' | 'bonus' | 'referral'
          stripe_payment_id?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          remaining?: number
          source?: 'purchase' | 'bonus' | 'referral'
          stripe_payment_id?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      credit_burns: {
        Row: {
          id: string
          user_id: string
          prompt_id: string | null
          flow_id: string | null
          model_id: string
          length: 'short' | 'medium' | 'long'
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
          length: 'short' | 'medium' | 'long'
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
          length?: 'short' | 'medium' | 'long'
          credits_used?: number
          from_bucket_id?: string
          creator_id?: string | null
          creator_fee?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_burns_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_burns_from_bucket_id_fkey"
            columns: ["from_bucket_id"]
            referencedRelation: "credit_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_burns_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount_usd: number
          credits_granted: number
          bonus_credits: number
          stripe_txn_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_usd: number
          credits_granted: number
          bonus_credits: number
          stripe_txn_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_usd?: number
          credits_granted?: number
          bonus_credits?: number
          stripe_txn_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system_prompt: string
          input_schema: Json | null
          model_id: string
          creator_fee: number | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system_prompt: string
          input_schema?: Json | null
          model_id: string
          creator_fee?: number | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          input_schema?: Json | null
          model_id?: string
          creator_fee?: number | null
          is_public?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          price?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flow_steps: {
        Row: {
          id: string
          flow_id: string
          prompt_id: string
          step_order: number
          input_mapping: Json | null
        }
        Insert: {
          id?: string
          flow_id: string
          prompt_id: string
          step_order: number
          input_mapping?: Json | null
        }
        Update: {
          id?: string
          flow_id?: string
          prompt_id?: string
          step_order?: number
          input_mapping?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_steps_prompt_id_fkey"
            columns: ["prompt_id"]
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      payouts: {
        Row: {
          id: string
          creator_id: string
          credits_earned: number
          usd_equivalent: number
          source_type: 'prompt' | 'flow'
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          credits_earned: number
          usd_equivalent: number
          source_type: 'prompt' | 'flow'
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          credits_earned?: number
          usd_equivalent?: number
          source_type?: 'prompt' | 'flow'
          source_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      automation_webhooks: {
        Row: {
          id: string
          user_id: string
          flow_id: string
          monthly_credit_burn: number | null
          last_triggered_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          flow_id: string
          monthly_credit_burn?: number | null
          last_triggered_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          flow_id?: string
          monthly_credit_burn?: number | null
          last_triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_webhooks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_webhooks_flow_id_fkey"
            columns: ["flow_id"]
            referencedRelation: "flows"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}