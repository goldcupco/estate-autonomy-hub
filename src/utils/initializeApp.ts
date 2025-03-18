
import { setupSupabaseTables, verifyDatabaseSetup } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';
import { supabase } from './supabaseClient';

// Create tables using direct SQL with explicit public schema reference
async function createTablesWithDirectSQL() {
  try {
    console.log('Attempting to create tables with direct SQL...');
    
    // Communication providers table
    try {
      const { data, error } = await supabase.from('communication_providers').select('count(*)').limit(1);
      if (error) {
        console.log('Table communication_providers does not exist, creating it...');
        await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.communication_providers (
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
        console.log('communication_providers table created successfully');
      } else {
        console.log('communication_providers table already exists');
      }
    } catch (err) {
      console.error('Error checking/creating communication_providers table:', err);
    }
    
    // Call records table
    try {
      const { data, error } = await supabase.from('call_records').select('count(*)').limit(1);
      if (error) {
        console.log('Table call_records does not exist, creating it...');
        await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.call_records (
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
        console.log('call_records table created successfully');
      } else {
        console.log('call_records table already exists');
      }
    } catch (err) {
      console.error('Error checking/creating call_records table:', err);
    }
    
    // SMS records table
    try {
      const { data, error } = await supabase.from('sms_records').select('count(*)').limit(1);
      if (error) {
        console.log('Table sms_records does not exist, creating it...');
        await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.sms_records (
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
        console.log('sms_records table created successfully');
      } else {
        console.log('sms_records table already exists');
      }
    } catch (err) {
      console.error('Error checking/creating sms_records table:', err);
    }
    
    // Letter records table
    try {
      const { data, error } = await supabase.from('letter_records').select('count(*)').limit(1);
      if (error) {
        console.log('Table letter_records does not exist, creating it...');
        await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.letter_records (
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
        console.log('letter_records table created successfully');
      } else {
        console.log('letter_records table already exists');
      }
    } catch (err) {
      console.error('Error checking/creating letter_records table:', err);
    }
    
    // Add uuid-ossp extension if it doesn't exist (for uuid_generate_v4())
    try {
      await supabase.rpc('execute_sql', {
        sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      });
      console.log('uuid-ossp extension created if needed');
    } catch (err) {
      console.error('Error creating uuid-ossp extension:', err);
    }
    
    return true;
  } catch (error) {
    console.error('SQL execution error:', error);
    return false;
  }
}

// Fallback method: Try to create tables by inserting test records
async function createTablesByInsertingTestRecords() {
  console.log('Attempting to create tables by inserting test records...');
  
  try {
    // Communication providers table
    try {
      await supabase.from('communication_providers').insert({
        user_id: 'test-user',
        name: 'Test Provider',
        type: 'twilio',
        is_default: false,
        config: {}
      }).select();
      console.log('Inserted test record into communication_providers');
    } catch (err) {
      console.warn('Could not insert into communication_providers:', err);
    }
    
    // Call records table
    try {
      await supabase.from('call_records').insert({
        user_id: 'test-user',
        provider_id: 'test-provider',
        provider_type: 'twilio',
        call_id: 'test-call',
        phone_number: '+1234567890',
        contact_name: 'Test Contact',
        duration: 0
      }).select();
      console.log('Inserted test record into call_records');
    } catch (err) {
      console.warn('Could not insert into call_records:', err);
    }
    
    // SMS records table
    try {
      await supabase.from('sms_records').insert({
        user_id: 'test-user',
        provider_id: 'test-provider',
        sms_id: 'test-sms',
        phone_number: '+1234567890',
        message: 'Test message',
        direction: 'outgoing'
      }).select();
      console.log('Inserted test record into sms_records');
    } catch (err) {
      console.warn('Could not insert into sms_records:', err);
    }
    
    // Letter records table
    try {
      await supabase.from('letter_records').insert({
        user_id: 'test-user',
        recipient: 'Test Recipient',
        content: 'Test content',
        status: 'draft'
      }).select();
      console.log('Inserted test record into letter_records');
    } catch (err) {
      console.warn('Could not insert into letter_records:', err);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating tables by insertion:', error);
    return false;
  }
}

// Create the tables in Supabase via SQL commands
async function createTablesViaSQL() {
  try {
    console.log('Creating tables via SQL commands...');
    
    const createCommunicationProvidersSQL = `
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
    `;
    
    const createCallRecordsSQL = `
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
    `;
    
    const createSmsRecordsSQL = `
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
    `;
    
    const createLetterRecordsSQL = `
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
    `;
    
    // Try to execute the SQL directly
    const { error: cp_error } = await supabase.rpc('exec_sql', { query: createCommunicationProvidersSQL });
    if (cp_error) console.warn('Error creating communication_providers:', cp_error);
    else console.log('Communication providers table created');
    
    const { error: cr_error } = await supabase.rpc('exec_sql', { query: createCallRecordsSQL });
    if (cr_error) console.warn('Error creating call_records:', cr_error);
    else console.log('Call records table created');
    
    const { error: sms_error } = await supabase.rpc('exec_sql', { query: createSmsRecordsSQL });
    if (sms_error) console.warn('Error creating sms_records:', sms_error);
    else console.log('SMS records table created');
    
    const { error: lr_error } = await supabase.rpc('exec_sql', { query: createLetterRecordsSQL });
    if (lr_error) console.warn('Error creating letter_records:', lr_error);
    else console.log('Letter records table created');
    
    return !cp_error || !cr_error || !sms_error || !lr_error;
  } catch (error) {
    console.error('Error with SQL execution:', error);
    return false;
  }
}

export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // Try creating tables with direct SQL first
    console.log('STEP 1: Attempting to create tables with direct SQL');
    const sqlResult = await createTablesWithDirectSQL();
    if (sqlResult) {
      console.log('Tables created successfully with direct SQL');
    } else {
      console.log('Direct SQL table creation had issues, trying alternative methods');
    }
    
    // Try the standard approach next
    console.log('STEP 2: Setting up database tables through Supabase setup');
    const setupResult = await setupSupabaseTables();
    
    if (setupResult.success) {
      console.log('Database tables created successfully through Supabase setup');
    } else {
      console.error('Database table creation via Supabase setup failed:', setupResult.error);
      
      // Try creating tables by inserting test records
      console.log('STEP 3: Attempting to create tables by inserting test records');
      const insertResult = await createTablesByInsertingTestRecords();
      if (insertResult) {
        console.log('Tables created successfully by test record insertion');
      } else {
        console.error('Test record insertion failed');
        
        // Last resort: Try SQL via a different RPC function
        console.log('STEP 4: Trying different RPC function for SQL execution');
        const sqlViaRpcResult = await createTablesViaSQL();
        if (sqlViaRpcResult) {
          console.log('Tables created successfully via RPC SQL execution');
        } else {
          console.error('RPC SQL execution failed');
        }
      }
    }
    
    // Finally verify the setup was successful
    console.log('STEP 5: Verifying database setup');
    const verifyResult = await verifyDatabaseSetup();
    
    if (verifyResult.success) {
      console.log('Database initialized successfully');
      console.log('Available tables:', verifyResult.tables);
      
      // Show success toast
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables are available.',
        variant: 'default'
      });
      
      return true;
    } else {
      console.error('Database initialization failed:', verifyResult.error || 'Unknown error');
      
      if (verifyResult.missingTables && verifyResult.missingTables.length > 0) {
        console.error('Missing tables:', verifyResult.missingTables);
      }
      
      toast({
        title: 'Database Setup Issue',
        description: 'There was a problem setting up the database. Some features may not work correctly.',
        variant: 'destructive'
      });
      
      return false;
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
    toast({
      title: 'Initialization Error',
      description: error instanceof Error ? error.message : 'Unknown error during application startup',
      variant: 'destructive'
    });
    
    return false;
  }
}

// We no longer need this function as we're doing everything in initializeApp
// but keep it for backward compatibility
export async function initializeDatabase() {
  return initializeApp();
}
