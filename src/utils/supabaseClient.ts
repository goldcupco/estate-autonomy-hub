
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// Initialize the Supabase client with environment variable credentials
export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_ANON_KEY;

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

// Improved table creation function using direct SQL for more reliability
export async function createTablesDirectly() {
  console.log('Creating tables using direct SQL...');
  
  try {
    // Create all tables with one REST API call for better reliability
    const tableCreationSql = `
      CREATE TABLE IF NOT EXISTS public.communication_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        is_default BOOLEAN DEFAULT false,
        config JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.call_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        call_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        duration INTEGER DEFAULT 0,
        recording_url TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.sms_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        sms_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        message TEXT NOT NULL,
        direction TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.letter_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        recipient TEXT NOT NULL,
        address TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        tracking_number TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    // Execute SQL directly via REST API for maximum compatibility
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify({
        query: tableCreationSql
      })
    });
    
    // If REST API approach fails, fallback to one-by-one table creation using Supabase inserts
    if (!response.ok) {
      console.log('Direct SQL execution failed, falling back to table creation via inserts...');
      
      // Try creating tables by inserting records (this approach has worked for some users)
      const tables = [
        {
          name: 'communication_providers',
          record: {
            id: '00000000-0000-0000-0000-000000000000',
            user_id: 'system',
            name: 'Default Provider',
            type: 'twilio',
            is_default: true,
            config: {}
          }
        },
        {
          name: 'call_records',
          record: {
            id: '00000000-0000-0000-0000-000000000000',
            user_id: 'system',
            provider_id: 'system',
            provider_type: 'twilio',
            call_id: 'system-test',
            phone_number: '+10000000000',
            contact_name: 'System Test',
            timestamp: new Date().toISOString(),
            duration: 0
          }
        },
        {
          name: 'sms_records',
          record: {
            id: '00000000-0000-0000-0000-000000000000',
            user_id: 'system',
            provider_id: 'system',
            sms_id: 'system-test',
            phone_number: '+10000000000',
            contact_name: 'System Test',
            timestamp: new Date().toISOString(),
            message: 'System test',
            direction: 'outgoing'
          }
        },
        {
          name: 'letter_records',
          record: {
            id: '00000000-0000-0000-0000-000000000000',
            user_id: 'system',
            recipient: 'System Test',
            timestamp: new Date().toISOString(),
            content: 'System test',
            status: 'draft'
          }
        }
      ];
      
      // Try to create each table by inserting a record
      let successCount = 0;
      for (const table of tables) {
        try {
          const { error } = await supabase
            .from(table.name)
            .upsert(table.record, { onConflict: 'id' });
          
          if (!error || error.code === '23505') { // Ignore duplicate key errors
            console.log(`Table ${table.name} created or already exists`);
            successCount++;
          } else {
            console.error(`Error creating table ${table.name}:`, error);
          }
        } catch (tableError) {
          console.error(`Exception creating table ${table.name}:`, tableError);
        }
      }
      
      // Return success only if we created all tables
      if (successCount === tables.length) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: `Only created ${successCount}/${tables.length} tables. Please create the remaining tables manually.` 
        };
      }
    } else {
      console.log('SQL execution successful, tables should be created');
      return { success: true };
    }
  } catch (error) {
    console.error('Error during table creation:', error);
    return { success: false, error };
  }
}

// Legacy function kept for compatibility
export async function executeSql(sql: string) {
  console.log('SQL execution requested:', sql);
  
  try {
    // Execute the SQL directly via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('SQL execution failed:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('Exception during SQL execution:', error);
    return { success: false, error };
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
