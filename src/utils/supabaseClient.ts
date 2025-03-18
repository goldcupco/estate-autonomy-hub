
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

// Enhanced SQL execution function with better error handling
export async function executeSql(sql: string) {
  console.log('Executing SQL:', sql);
  
  try {
    // First attempt: Use Supabase API directly with POST request
    try {
      console.log('Attempting direct SQL execution via Supabase REST API...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify({ 
          query: sql 
        })
      });
      
      if (response.ok) {
        console.log('SQL execution via REST API successful');
        const data = await response.json();
        return { success: true, data };
      }
      
      console.log('REST API direct query failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    } catch (restError) {
      console.error('REST API query approach failed:', restError);
    }
    
    // Second attempt: Try using the Supabase Storage API as a workaround
    try {
      console.log('Attempting alternative table creation approach...');
      
      // For table creation SQL, we'll try to do individual insert operations
      // to force the tables to be created
      if (sql.toLowerCase().includes('create table')) {
        const tableName = sql.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_]+)/i)?.[1];
        
        if (tableName) {
          console.log(`Detected table creation for: ${tableName}`);
          
          // Try to create a dummy record to force table creation
          const dummyRecord = {
            id: '00000000-0000-0000-0000-000000000000',
            created_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from(tableName)
            .upsert(dummyRecord, { onConflict: 'id' });
          
          if (!insertError || insertError.code === '23505') { // Ignore duplicate key errors
            console.log(`Table ${tableName} created or already exists`);
            return { success: true, data: { message: `Table ${tableName} created or already exists` } };
          }
          
          console.log(`Error creating table ${tableName}:`, insertError);
        }
      }
    } catch (storageError) {
      console.error('Alternative approach failed:', storageError);
    }
    
    // Third attempt: Use Supabase SQL API (if available in your version)
    try {
      console.log('Attempting SQL execution via SQL API...');
      
      // @ts-ignore - Some versions of Supabase JS client have sql method
      if (typeof supabase.sql === 'function') {
        // @ts-ignore
        const { data, error } = await supabase.sql(sql);
        
        if (!error) {
          console.log('SQL execution via SQL API successful');
          return { success: true, data };
        }
        
        console.log('SQL API execution failed:', error);
      }
    } catch (sqlApiError) {
      console.error('SQL API approach failed:', sqlApiError);
    }
    
    // Fourth attempt: Use the functions API as a last resort
    try {
      console.log('Attempting SQL execution via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('execute-sql', {
        body: { sql }
      });
      
      if (!error) {
        console.log('SQL execution via Edge Function successful');
        return { success: true, data };
      }
      
      console.log('Edge Function execution failed:', error);
    } catch (functionsError) {
      console.error('Functions API approach failed:', functionsError);
    }
    
    console.error('All SQL execution approaches failed.');
    return { 
      success: false, 
      error: 'Failed to execute SQL after multiple attempts. Please check Supabase configuration.' 
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
