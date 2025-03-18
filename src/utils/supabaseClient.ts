
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with provided credentials
const supabaseUrl = 'https://gdxzktqieasxxcocwsjh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY';

// Create the client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Enhanced SQL execution function for table creation
export async function executeSql(sql: string) {
  console.log('Executing SQL:', sql);
  
  try {
    // First try using the built-in RPC method if available
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (!rpcError) {
      console.log('SQL execution via RPC successful');
      return { success: true, data: rpcData };
    }
    
    console.log('RPC failed with error:', rpcError.message);
    console.log('Trying direct REST API approach...');
    
    // Get the current session for auth
    const { data: { session } } = await supabase.auth.getSession();
    
    // Execute SQL directly through REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Try a third approach with the SQL endpoint
      console.log('Direct REST API failed, trying SQL endpoint...');
      
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!sqlResponse.ok) {
        console.error('All SQL execution approaches failed', await sqlResponse.text());
        return { 
          success: false, 
          error: `Failed to execute SQL: ${await sqlResponse.text()}` 
        };
      }
      
      return { success: true, data: await sqlResponse.json() };
    }
    
    console.log('SQL execution via REST API successful');
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error executing SQL'
    };
  }
}

// Type definitions for our database tables
export type ProviderType = 'twilio' | 'callrail';

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

export interface DbCallRecord {
  id: string;
  user_id: string;
  provider_id: string;
  provider_type: ProviderType;
  call_id: string;
  phone_number: string;
  contact_name: string;
  timestamp: string;
  duration: number;
  recording_url?: string;
  notes?: string;
  created_at: string;
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
  created_at: string;
}

export interface DbLetterRecord {
  id: string;
  user_id: string;
  recipient: string;
  address?: string;
  timestamp: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered';
  tracking_number?: string;
  created_at: string;
}
