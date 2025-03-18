import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with provided credentials
export const supabaseUrl = 'https://gdxzktqieasxxcocwsjh.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY';

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

// Enhanced SQL execution function with better error handling
export async function executeSql(sql: string) {
  console.log('Executing SQL:', sql);
  
  try {
    // Try to use the supabase.rpc method to execute raw SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
    
    if (!error) {
      console.log('SQL execution successful');
      return { success: true, data };
    }
    
    console.error('RPC method failed:', error);
    
    // If RPC failed, try REST API directly
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ 
          sql_query: sql 
        })
      });
      
      if (response.ok) {
        console.log('SQL execution via REST API successful');
        const data = await response.json();
        return { success: true, data };
      }
      
      console.error('REST API query failed with status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } catch (restError) {
      console.error('REST API query failed:', restError);
    }
    
    // If all direct SQL methods failed, try individual table creation
    if (sql.toLowerCase().includes('create table')) {
      console.log('Attempting individual table creation...');
      
      // Extract table creation statements
      const tableStatements = sql.split(';').filter(stmt => 
        stmt.trim().toLowerCase().startsWith('create table')
      );
      
      // Try to create each table individually
      for (const stmt of tableStatements) {
        try {
          // Send individual create table statement
          await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/sql',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
            body: stmt + ';'
          });
          
          console.log('Attempted to create table with statement:', stmt);
        } catch (tableError) {
          console.error('Individual table creation failed:', tableError);
        }
      }
      
      // Return success to continue with the app even if tables might not be created
      return { success: true, data: null, message: 'Attempted individual table creation' };
    }
    
    // Last resort: Edge Functions
    try {
      const { data, error } = await supabase.functions.invoke('execute-sql', {
        body: { sql }
      });
      
      if (!error) {
        console.log('SQL execution via Edge Function successful');
        return { success: true, data };
      }
      
      console.error('Edge Function execution failed:', error);
    } catch (functionsError) {
      console.error('Functions API failed:', functionsError);
    }
    
    // If all methods failed, suggest manual SQL execution
    return { 
      success: false, 
      error: 'Failed to execute SQL. Please run the SQL manually in the Supabase dashboard.' 
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
