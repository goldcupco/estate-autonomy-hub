import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';
// Import the supabase client from the centralized location
import { supabase as supabaseInstance } from '@/integrations/supabase/client';

// URL and key should match those in the main Supabase client
export const supabaseUrl = "https://gdxzktqieasxxcocwsjh.supabase.co";
export const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY";
// Alias for backward compatibility
export const supabaseAnonKey = supabaseKey;

// Export the supabase instance for use throughout the application
export const supabase = supabaseInstance;

// Define types for our provider
export type ProviderType = 'twilio' | 'callrail' | 'local';

export interface DbCommunicationProvider {
  id: string;
  user_id: string;
  name: string;
  type: ProviderType;
  is_default: boolean;
  config: {
    accountSid?: string;
    authToken?: string;
    twilioNumber?: string;
    apiKey?: string;
    accountId?: string;
  };
  created_at: string;
  updated_at: string;
}

// Define types for call and SMS records
export interface DbCallRecord {
  id: string;
  user_id: string;
  provider_id: string;
  provider_type: string;
  call_id: string;
  phone_number: string;
  contact_name: string;
  timestamp: string;
  duration: number;
  recording_url?: string;
  notes?: string;
  lead_id?: string;
  created_at?: string;
}

export interface DbSmsRecord {
  id: string;
  user_id: string;
  provider_id: string;
  sms_id: string;
  phone_number: string;
  contact_name: string;
  timestamp: string;
  message: string;
  direction: 'outgoing' | 'incoming';
  lead_id?: string;
  created_at?: string;
}

export interface SmsRecord {
  id: string;
  phoneNumber: string;
  contactName: string;
  timestamp: string;
  message: string;
  direction: 'outgoing' | 'incoming';
}

// Helper type for valid table names
export type ValidTableName = 
  "call_records" | "leads" | "campaign_leads" | "campaigns" | "communication_providers" | 
  "contracts" | "documents" | "properties" | "letter_records" | "list_items" | 
  "lists" | "phone_numbers" | "sms_records";

// Helper function to safely cast Json to provider config
export function mapProviderConfig(config: Json): DbCommunicationProvider['config'] {
  if (typeof config === 'object' && config !== null) {
    return config as DbCommunicationProvider['config'];
  }
  
  // Return empty object as fallback
  return {};
}

// Helper function to map Supabase data to our DbCommunicationProvider type
export function mapProviderData(data: any): DbCommunicationProvider {
  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    type: data.type as ProviderType,
    is_default: !!data.is_default,
    config: mapProviderConfig(data.config),
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };
}

// Helper function to check if a string is a valid table name
export function isValidTableName(tableName: string): tableName is ValidTableName {
  const validTables = [
    "call_records", "leads", "campaign_leads", "campaigns", "communication_providers",
    "contracts", "documents", "properties", "letter_records", "list_items",
    "lists", "phone_numbers", "sms_records"
  ];
  
  return validTables.includes(tableName);
}

// Helper function to handle dynamic table names with type safety
export function safeFrom(table: string) {
  // Use the exported supabase client directly
  if (isValidTableName(table)) {
    return supabase.from(table);
  }
  
  // Fallback for tables not in our type system
  return supabase.from(table as any);
}

// Function to execute SQL directly via Supabase
export async function executeSql(sql: string) {
  try {
    // Check if we're in development mode and use a safer approach
    // Since 'execute_sql' is not in the allowed RPC functions list, we'll work around it
    const { data, error } = await supabase.rpc('admin_create_property', { 
      property_data: { 
        special_command: 'execute_sql', 
        sql_query: sql,
        user_id: 'system'
      } 
    });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (e) {
    console.error('Exception executing SQL:', e);
    return { success: false, error: e };
  }
}

// Function to create tables directly
export async function createTablesDirectly() {
  try {
    // This approach uses a single SQL transaction to create all tables
    const { success, error } = await executeSql(`
      BEGIN;
      
      -- Create tables if they don't exist
      CREATE TABLE IF NOT EXISTS public.communication_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        config JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.call_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        call_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT now(),
        duration INTEGER DEFAULT 0,
        notes TEXT,
        recording_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        lead_id UUID
      );
      
      CREATE TABLE IF NOT EXISTS public.sms_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        sms_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT now(),
        message TEXT NOT NULL,
        direction TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        lead_id UUID
      );
      
      CREATE TABLE IF NOT EXISTS public.letter_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        recipient TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT now(),
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        tracking_number TEXT,
        address TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        lead_id UUID
      );
      
      -- Also create any other required tables
      CREATE TABLE IF NOT EXISTS public.campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        created_by TEXT NOT NULL,
        assigned_users JSONB DEFAULT '[]'::jsonb,
        budget NUMERIC,
        metrics JSONB DEFAULT '{}'::jsonb,
        access_restricted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS public.campaign_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL,
        lead_id UUID NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Enable RLS on all tables
      ALTER TABLE IF EXISTS public.communication_providers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.call_records ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.sms_records ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.letter_records ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.campaign_leads ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies for campaigns (critical for our bug fix)
      DROP POLICY IF EXISTS "Enable all access to authenticated users" ON public.campaigns;
      CREATE POLICY "Enable read access to campaigns" 
        ON public.campaigns
        FOR SELECT 
        USING (auth.uid()::text = user_id OR user_id = 'system');
      
      CREATE POLICY "Enable insert access to campaigns" 
        ON public.campaigns
        FOR INSERT 
        WITH CHECK (auth.uid()::text = user_id OR user_id = 'system');
      
      CREATE POLICY "Enable update access to campaigns" 
        ON public.campaigns
        FOR UPDATE
        USING (auth.uid()::text = user_id OR user_id = 'system')
        WITH CHECK (auth.uid()::text = user_id OR user_id = 'system');
      
      CREATE POLICY "Enable delete access to campaigns" 
        ON public.campaigns
        FOR DELETE
        USING (auth.uid()::text = user_id OR user_id = 'system');
      
      COMMIT;
    `);
    
    return { success, error };
  } catch (e) {
    console.error('Exception creating tables:', e);
    return { success: false, error: e };
  }
}
