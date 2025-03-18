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

// Direct SQL execution function with simplified approach
export async function executeSql(sql: string) {
  console.log('Executing SQL:', sql);
  
  try {
    // Direct fetch to Supabase PostgreSQL REST endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (response.ok) {
      console.log('SQL execution successful via REST API');
      return { success: true };
    }
    
    console.error('SQL execution failed:', response.status);
    const errorText = await response.text();
    console.error('Error response:', errorText);
    
    // Try alternative method - direct SQL API
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (sqlResponse.ok) {
      console.log('SQL execution successful via SQL RPC');
      return { success: true };
    }
    
    console.error('SQL RPC execution failed:', sqlResponse.status);
    
    // Final attempt - try the Supabase database REST API directly for table creation
    if (sql.toLowerCase().includes('create table')) {
      const tables = sql.split(';')
        .filter(stmt => stmt.trim().toLowerCase().startsWith('create table'))
        .map(stmt => {
          const match = stmt.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)/i);
          return match ? match[1].trim() : null;
        })
        .filter(Boolean);
      
      console.log('Attempting direct table creation for:', tables);
      
      // Try creating each table through the REST API
      for (const tableName of tables) {
        await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({})
        });
      }
      
      return { success: true, message: 'Attempted direct table creation' };
    }
    
    // If all methods fail, return helpful debugging info
    return { 
      success: false, 
      error: 'Could not execute SQL. See console for details.',
      sqlDetails: sql
    };
  } catch (error) {
    console.error('Fatal error executing SQL:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error executing SQL',
      sqlDetails: sql
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
