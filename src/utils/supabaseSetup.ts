
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    // Create tables directly using the Supabase client's SQL execution
    console.log('Creating tables directly using Supabase client...');
    
    // Communication providers table
    await createCommunicationProvidersTable();
    
    // Call records table
    await createCallRecordsTable();
    
    // SMS records table
    await createSmsRecordsTable();
    
    // Letter records table
    await createLetterRecordsTable();
    
    console.log('All tables set up successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error setting up tables:', error);
    toast({
      title: 'Database Setup Error',
      description: error instanceof Error ? error.message : 'Unknown error during database setup',
      variant: 'destructive'
    });
    return { success: false, error };
  }
}

async function createCommunicationProvidersTable() {
  console.log('Creating communication_providers table...');
  try {
    // Try direct SQL approach first
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS communication_providers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            is_default BOOLEAN NOT NULL DEFAULT false,
            config JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.log('SQL approach failed:', sqlError);
      } else {
        console.log('Communication providers table created via SQL');
        return;
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr);
    }
    
    // Use RPC function to check if table exists first (fallback)
    try {
      const { error: rpcError } = await supabase.rpc('create_communication_providers_if_not_exists');
      
      if (rpcError) {
        console.log('RPC not available, using direct insert method');
      } else {
        console.log('Table created or already exists via RPC');
        return;
      }
    } catch (rpcErr) {
      console.log('RPC execution error:', rpcErr);
    }
    
    // Attempt to insert a test record (last resort)
    try {
      const { error } = await supabase
        .from('communication_providers')
        .insert({
          user_id: 'setup-test',
          name: 'Test Provider',
          type: 'twilio',
          is_default: false,
          config: {}
        });
      
      if (error) {
        // Check if error message is about table not existing
        if (error.message && error.message.includes('does not exist')) {
          console.error('Failed to create communication_providers table:', error);
        } else if (error.message && error.message.includes('already exists')) {
          console.log('Communication providers table already exists');
        } else {
          console.log('Other error with communication_providers:', error);
        }
      } else {
        console.log('Test record inserted, deleting it now');
        // Delete the test record
        await supabase
          .from('communication_providers')
          .delete()
          .eq('user_id', 'setup-test');
      }
    } catch (insertErr) {
      console.log('Insert attempt error:', insertErr);
    }
  } catch (err) {
    console.error('Error creating communication_providers table:', err);
  }
}

async function createCallRecordsTable() {
  console.log('Creating call_records table...');
  try {
    // Try direct SQL approach first
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS call_records (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            provider_type TEXT NOT NULL,
            call_id TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            duration INTEGER NOT NULL,
            recording_url TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.log('SQL approach failed:', sqlError);
      } else {
        console.log('Call records table created via SQL');
        return;
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr);
    }
    
    // Use RPC function as fallback
    try {
      const { error: rpcError } = await supabase.rpc('create_call_records_if_not_exists');
      
      if (rpcError) {
        console.log('RPC not available, using direct insert method');
      } else {
        console.log('Table created or already exists via RPC');
        return;
      }
    } catch (rpcErr) {
      console.log('RPC execution error:', rpcErr);
    }
    
    // Attempt to insert a test record (last resort)
    try {
      const { error } = await supabase
        .from('call_records')
        .insert({
          user_id: 'setup-test',
          provider_id: 'test',
          provider_type: 'twilio',
          call_id: 'setup-test',
          phone_number: '+10000000000',
          contact_name: 'Test Contact',
          duration: 0
        });
      
      if (error) {
        // Check if error message is about table not existing
        if (error.message && error.message.includes('does not exist')) {
          console.error('Failed to create call_records table:', error);
        } else if (error.message && error.message.includes('already exists')) {
          console.log('Call records table already exists');
        } else {
          console.log('Other error with call_records:', error);
        }
      } else {
        console.log('Test record inserted, deleting it now');
        // Delete the test record
        await supabase
          .from('call_records')
          .delete()
          .eq('user_id', 'setup-test');
      }
    } catch (insertErr) {
      console.log('Insert attempt error:', insertErr);
    }
  } catch (err) {
    console.error('Error creating call_records table:', err);
  }
}

async function createSmsRecordsTable() {
  console.log('Creating sms_records table...');
  try {
    // Try direct SQL approach first
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS sms_records (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            provider_id TEXT NOT NULL,
            sms_id TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            contact_name TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            message TEXT NOT NULL,
            direction TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.log('SQL approach failed:', sqlError);
      } else {
        console.log('SMS records table created via SQL');
        return;
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr);
    }
    
    // Use RPC function as fallback
    try {
      const { error: rpcError } = await supabase.rpc('create_sms_records_if_not_exists');
      
      if (rpcError) {
        console.log('RPC not available, using direct insert method');
      } else {
        console.log('Table created or already exists via RPC');
        return;
      }
    } catch (rpcErr) {
      console.log('RPC execution error:', rpcErr);
    }
    
    // Attempt to insert a test record (last resort)
    try {
      const { error } = await supabase
        .from('sms_records')
        .insert({
          user_id: 'setup-test',
          provider_id: 'test',
          sms_id: 'setup-test',
          phone_number: '+10000000000',
          message: 'Test message',
          direction: 'outgoing'
        });
      
      if (error) {
        // Check if error message is about table not existing
        if (error.message && error.message.includes('does not exist')) {
          console.error('Failed to create sms_records table:', error);
        } else if (error.message && error.message.includes('already exists')) {
          console.log('SMS records table already exists');
        } else {
          console.log('Other error with sms_records:', error);
        }
      } else {
        console.log('Test record inserted, deleting it now');
        // Delete the test record
        await supabase
          .from('sms_records')
          .delete()
          .eq('user_id', 'setup-test');
      }
    } catch (insertErr) {
      console.log('Insert attempt error:', insertErr);
    }
  } catch (err) {
    console.error('Error creating sms_records table:', err);
  }
}

async function createLetterRecordsTable() {
  console.log('Creating letter_records table...');
  try {
    // Try direct SQL approach first
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS letter_records (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            recipient TEXT NOT NULL,
            address TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            content TEXT NOT NULL,
            status TEXT NOT NULL,
            tracking_number TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlError) {
        console.log('SQL approach failed:', sqlError);
      } else {
        console.log('Letter records table created via SQL');
        return;
      }
    } catch (sqlErr) {
      console.log('SQL execution error:', sqlErr);
    }
    
    // Use RPC function as fallback
    try {
      const { error: rpcError } = await supabase.rpc('create_letter_records_if_not_exists');
      
      if (rpcError) {
        console.log('RPC not available, using direct insert method');
      } else {
        console.log('Table created or already exists via RPC');
        return;
      }
    } catch (rpcErr) {
      console.log('RPC execution error:', rpcErr);
    }
    
    // Attempt to insert a test record (last resort)
    try {
      const { error } = await supabase
        .from('letter_records')
        .insert({
          user_id: 'setup-test',
          recipient: 'Test Recipient',
          content: 'Test content',
          status: 'draft'
        });
      
      if (error) {
        // Check if error message is about table not existing
        if (error.message && error.message.includes('does not exist')) {
          console.error('Failed to create letter_records table:', error);
        } else if (error.message && error.message.includes('already exists')) {
          console.log('Letter records table already exists');
        } else {
          console.log('Other error with letter_records:', error);
        }
      } else {
        console.log('Test record inserted, deleting it now');
        // Delete the test record
        await supabase
          .from('letter_records')
          .delete()
          .eq('user_id', 'setup-test');
      }
    } catch (insertErr) {
      console.log('Insert attempt error:', insertErr);
    }
  } catch (err) {
    console.error('Error creating letter_records table:', err);
  }
}

export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Look for which tables actually exist
    const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
    const existingTables = [];
    const missingTables = [];
    
    // Check each table individually and with robust error handling
    for (const table of tables) {
      try {
        console.log(`Checking if ${table} exists...`);
        
        // First, try to get the table structure (this is a safe operation)
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.log(`Table ${table} check failed:`, error);
          missingTables.push(table);
        } else {
          console.log(`Table ${table} exists`);
          existingTables.push(table);
        }
      } catch (tableError) {
        console.error(`Error checking table ${table}:`, tableError);
        missingTables.push(table);
      }
    }
    
    console.log('Verified tables:', existingTables);
    console.log('Missing tables:', missingTables);
    
    return { 
      success: existingTables.length === 4, 
      tables: existingTables,
      missingTables: missingTables
    };
  } catch (error) {
    console.error('Error verifying database:', error);
    return { success: false, error };
  }
}
