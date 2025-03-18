
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

// Enhanced SQL execution function for table creation with better error handling
export async function executeSql(sql: string) {
  console.log('Executing SQL:', sql);
  
  try {
    // First try using the supabase.rpc method
    try {
      console.log('Trying SQL execution via RPC...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (!rpcError) {
        console.log('SQL execution via RPC successful');
        return { success: true, data: rpcData };
      }
      
      console.log('RPC failed with error:', rpcError.message);
    } catch (rpcError) {
      console.log('RPC method failed with exception:', rpcError);
    }
    
    console.log('Trying direct REST API approach...');
    
    // Try direct fetch to the REST API endpoint
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (response.ok) {
        console.log('SQL execution via direct REST API successful');
        return { success: true, data: await response.json() };
      }
      
      console.log('Direct REST API failed with status:', response.status);
      console.log('Error response:', await response.text());
    } catch (fetchError) {
      console.error('Fetch to REST API failed:', fetchError);
    }
    
    // Last resort: try to use a direct query
    // Note: We've changed this approach since rpc is not available on the from() method
    console.log('Trying direct query approach...');
    try {
      // Execute a simple query to test database connectivity
      const { data: queryData, error: queryError } = await supabase
        .from('_dummy_table_check')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (queryError && queryError.code !== '42P01') { // Ignore "relation does not exist" error
        console.error('Database connectivity test failed:', queryError);
      } else {
        console.log('Database connection is working');
      }
      
      // Use direct rpc method instead of from()._temp_query.rpc
      const { data: directRpcData, error: directRpcError } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (directRpcError) {
        console.error('Direct RPC call failed:', directRpcError);
        return { 
          success: false, 
          error: `Failed to execute SQL: ${directRpcError.message}` 
        };
      }
      
      console.log('SQL execution via direct RPC successful');
      return { success: true, data: directRpcData };
    } catch (error) {
      console.error('Direct query approach failed:', error);
    }
    
    return { 
      success: false, 
      error: 'All SQL execution approaches failed' 
    };
  } catch (error) {
    console.error('Fatal error executing SQL:', error);
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
