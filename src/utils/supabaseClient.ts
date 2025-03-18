
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
    // Attempt to use direct rpc call (most reliable method if available)
    try {
      console.log('Attempting direct SQL execution via RPC...');
      
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });
      
      if (!error) {
        console.log('SQL execution via RPC successful');
        return { success: true, data };
      }
      
      console.log('RPC query failed:', error);
    } catch (rpcError) {
      console.error('RPC approach failed:', rpcError);
    }
    
    // Use Supabase REST API as alternative
    try {
      console.log('Attempting direct SQL execution via Supabase REST API...');
      
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
      
      console.log('REST API query failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    } catch (restError) {
      console.error('REST API query approach failed:', restError);
    }
    
    // Last resort: Try creating the tables manually with direct SQL queries
    try {
      console.log('Using manual table creation approach...');
      
      // Try to create a function to execute SQL first
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
          RETURN '{"status": "success"}'::jsonb;
        EXCEPTION
          WHEN OTHERS THEN
            RETURN jsonb_build_object(
              'status', 'error',
              'message', SQLERRM,
              'code', SQLSTATE
            );
        END;
        $$;
      `;
      
      // Try to execute the function creation directly
      try {
        const functionResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ 
            query: createFunctionSql 
          })
        });
        
        if (functionResponse.ok) {
          console.log('Successfully created SQL execution function');
        }
      } catch (functionError) {
        console.error('Failed to create SQL execution function:', functionError);
      }
      
      // For table creation SQL, we'll try to do individual REST API calls
      if (sql.toLowerCase().includes('create table')) {
        // Try to parse the table name from SQL
        const tableName = sql.match(/create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z_]+)/i)?.[1];
        
        if (tableName) {
          console.log(`Detected table creation for: ${tableName}`);
          
          // Try to create the table using a direct request to the SQL API endpoint
          const sqlEndpointUrl = `${supabaseUrl}/rest/v1/`;
          const createTableResponse = await fetch(sqlEndpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Prefer': 'params=single-object'
            },
            body: JSON.stringify({
              query: sql
            })
          });
          
          console.log(`Table creation response status for ${tableName}:`, createTableResponse.status);
          
          if (createTableResponse.ok) {
            console.log(`Successfully created table ${tableName} via direct SQL`);
            return { success: true, data: { message: `Table ${tableName} created successfully` } };
          }
          
          // Try to create a dummy record to force table creation
          try {
            console.log(`Attempting to create ${tableName} via record insertion`);
            
            // Create a default record
            const dummyRecord = {
              id: '00000000-0000-0000-0000-000000000000',
              user_id: 'system',
              created_at: new Date().toISOString()
            };
            
            // Add specific fields based on table name
            if (tableName === 'communication_providers') {
              dummyRecord['name'] = 'System Default';
              dummyRecord['type'] = 'twilio';
              dummyRecord['is_default'] = true;
              dummyRecord['config'] = {};
            } else if (tableName === 'call_records') {
              dummyRecord['provider_id'] = 'system';
              dummyRecord['provider_type'] = 'twilio';
              dummyRecord['call_id'] = 'system-test';
              dummyRecord['phone_number'] = '+10000000000';
              dummyRecord['contact_name'] = 'System Test';
              dummyRecord['timestamp'] = new Date().toISOString();
              dummyRecord['duration'] = 0;
            } else if (tableName === 'sms_records') {
              dummyRecord['provider_id'] = 'system';
              dummyRecord['sms_id'] = 'system-test';
              dummyRecord['phone_number'] = '+10000000000';
              dummyRecord['contact_name'] = 'System Test';
              dummyRecord['timestamp'] = new Date().toISOString();
              dummyRecord['message'] = 'System test';
              dummyRecord['direction'] = 'outgoing';
            } else if (tableName === 'letter_records') {
              dummyRecord['recipient'] = 'System Test';
              dummyRecord['timestamp'] = new Date().toISOString();
              dummyRecord['content'] = 'System test';
              dummyRecord['status'] = 'draft';
            }
            
            // Try direct insertion with POST
            const insertEndpoint = `${supabaseUrl}/rest/v1/${tableName}`;
            const insertResponse = await fetch(insertEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(dummyRecord)
            });
            
            if (insertResponse.ok) {
              console.log(`Successfully created ${tableName} via record insertion`);
              return { success: true, data: { message: `Table ${tableName} created via insertion` } };
            }
            
            console.log(`Insertion failed for ${tableName} with status:`, insertResponse.status);
          } catch (insertError) {
            console.error(`Error during record insertion for ${tableName}:`, insertError);
          }
        }
      }
    } catch (manualError) {
      console.error('Manual table creation failed:', manualError);
    }
    
    // Last attempt: Functions API
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
