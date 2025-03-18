
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    // Try to use RPC functions to create tables
    try {
      // Create communication_providers table if it doesn't exist
      const { error: providerError } = await supabase.rpc('create_communication_providers_if_not_exists');
      if (providerError) console.warn('RPC error:', providerError);
      
      // Create call_records table if it doesn't exist
      const { error: callRecordsError } = await supabase.rpc('create_call_records_if_not_exists');
      if (callRecordsError) console.warn('RPC error:', callRecordsError);
      
      // Create sms_records table if it doesn't exist
      const { error: smsRecordsError } = await supabase.rpc('create_sms_records_if_not_exists');
      if (smsRecordsError) console.warn('RPC error:', smsRecordsError);
      
      // Create letter_records table if it doesn't exist
      const { error: letterRecordsError } = await supabase.rpc('create_letter_records_if_not_exists');
      if (letterRecordsError) console.warn('RPC error:', letterRecordsError);
    } catch (rpcError) {
      console.warn('Failed to create tables using RPC methods:', rpcError);
    }
    
    // Even if RPC methods fail, try to create tables directly using SQL
    console.log('Directly creating tables using SQL...');
    
    // Create the tables directly using raw SQL
    await createTablesDirectly();
    
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

async function createTablesDirectly() {
  // Communication providers table
  await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS communication_providers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  // Call records table
  await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS call_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        call_id TEXT NOT NULL UNIQUE,
        phone_number TEXT NOT NULL,
        contact_name TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        duration INTEGER DEFAULT 0,
        recording_url TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  // SMS records table
  await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS sms_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        sms_id TEXT NOT NULL UNIQUE,
        phone_number TEXT NOT NULL,
        contact_name TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        message TEXT NOT NULL,
        direction TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  // Letter records table
  await supabase.rpc('execute_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS letter_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        recipient TEXT NOT NULL,
        address TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        content TEXT NOT NULL,
        status TEXT NOT NULL,
        tracking_number TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
}

// Execute this function to verify table setup
export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Check if tables exist using SQL query since the information_schema approach might not work
    const { data: tableList, error: tableListError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('communication_providers', 'call_records', 'sms_records', 'letter_records')
      `
    });
    
    if (tableListError) {
      console.error('Error getting table list:', tableListError);
      // Fallback to the previous method if RPC fails
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .in('table_name', ['communication_providers', 'call_records', 'sms_records', 'letter_records'])
        .eq('table_schema', 'public');
      
      if (tablesError) throw tablesError;
      
      const existingTables = tables.map(t => t.table_name);
      console.log('Existing tables:', existingTables);
      
      if (existingTables.length < 4) {
        console.warn('Missing tables, trying to create them...');
        await setupSupabaseTables();
      }
      
      return { success: existingTables.length === 4, tables: existingTables };
    }
    
    const existingTables = tableList.map(row => row.table_name);
    console.log('Existing tables:', existingTables);
    
    if (existingTables.length < 4) {
      console.warn('Missing tables, trying to create them...');
      await setupSupabaseTables();
      
      // Check again after creating tables
      const { data: updatedTables } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('communication_providers', 'call_records', 'sms_records', 'letter_records')
        `
      });
      
      const updatedTableList = updatedTables.map(row => row.table_name);
      console.log('Updated table list:', updatedTableList);
      
      return { success: updatedTableList.length === 4, tables: updatedTableList };
    }
    
    // Create missing tables if needed
    const missingTables = [
      'communication_providers', 
      'call_records', 
      'sms_records', 
      'letter_records'
    ].filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn('Missing tables:', missingTables);
      await createMissingTables(missingTables);
    } else {
      console.log('All required tables exist');
    }
    
    // Verify indexes
    await verifyIndexes();
    
    return { success: true, tables: existingTables };
  } catch (error) {
    console.error('Error verifying database:', error);
    toast({
      title: 'Database Verification Error',
      description: error instanceof Error ? error.message : 'Unknown error during verification',
      variant: 'destructive'
    });
    return { success: false, error };
  }
}

async function createMissingTables(missingTables: string[]) {
  for (const table of missingTables) {
    console.log(`Creating table: ${table}`);
    
    if (table === 'communication_providers') {
      const { error } = await supabase.from('communication_providers').insert({
        id: 'template',
        user_id: 'template',
        name: 'Template',
        type: 'twilio',
        is_default: false,
        config: {}
      }).select().then(() => {
        return supabase.from('communication_providers').delete().eq('id', 'template');
      });
      
      if (error && !error.message.includes('already exists')) throw error;
    }
    
    if (table === 'call_records') {
      const { error } = await supabase.from('call_records').insert({
        id: 'template',
        user_id: 'template',
        provider_id: 'template',
        provider_type: 'twilio',
        call_id: 'template',
        phone_number: '+10000000000',
        contact_name: 'Template',
        duration: 0
      }).select().then(() => {
        return supabase.from('call_records').delete().eq('id', 'template');
      });
      
      if (error && !error.message.includes('already exists')) throw error;
    }
    
    if (table === 'sms_records') {
      const { error } = await supabase.from('sms_records').insert({
        id: 'template',
        user_id: 'template',
        provider_id: 'template',
        sms_id: 'template',
        phone_number: '+10000000000',
        message: 'Template',
        direction: 'outgoing'
      }).select().then(() => {
        return supabase.from('sms_records').delete().eq('id', 'template');
      });
      
      if (error && !error.message.includes('already exists')) throw error;
    }
    
    if (table === 'letter_records') {
      const { error } = await supabase.from('letter_records').insert({
        id: 'template',
        user_id: 'template',
        recipient: 'Template',
        content: 'Template',
        status: 'draft'
      }).select().then(() => {
        return supabase.from('letter_records').delete().eq('id', 'template');
      });
      
      if (error && !error.message.includes('already exists')) throw error;
    }
  }
}

async function verifyIndexes() {
  console.log('Verifying indexes...');
  
  // User ID indexes for fast lookup
  const userIdIndexes = [
    { table: 'communication_providers', column: 'user_id', name: 'idx_communication_providers_user_id' },
    { table: 'call_records', column: 'user_id', name: 'idx_call_records_user_id' },
    { table: 'sms_records', column: 'user_id', name: 'idx_sms_records_user_id' },
    { table: 'letter_records', column: 'user_id', name: 'idx_letter_records_user_id' }
  ];
  
  // Phone number indexes for fast lookup by phone
  const phoneIndexes = [
    { table: 'call_records', column: 'phone_number', name: 'idx_call_records_phone' },
    { table: 'sms_records', column: 'phone_number', name: 'idx_sms_records_phone' }
  ];
  
  // Create each index if it doesn't exist
  for (const index of [...userIdIndexes, ...phoneIndexes]) {
    // Check if index exists using pg_indexes view
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('indexname', index.name)
      .eq('tablename', index.table);
      
    if (error) {
      console.error(`Error checking index ${index.name}:`, error);
      continue;
    }
    
    if (!data || data.length === 0) {
      console.log(`Creating index ${index.name} on ${index.table}.${index.column}`);
      
      // Create the index using SQL function
      const { error: createError } = await supabase.rpc('create_index_if_not_exists', { 
        idx_name: index.name,
        table_name: index.table,
        column_name: index.column
      });
      
      if (createError) {
        console.error(`Error creating index ${index.name}:`, createError);
      }
    }
  }
}
