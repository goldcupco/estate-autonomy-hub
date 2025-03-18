
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    // Create communication_providers table if it doesn't exist
    const { error: providerError } = await supabase.rpc('create_communication_providers_if_not_exists');
    if (providerError) throw providerError;
    
    // Create call_records table if it doesn't exist
    const { error: callRecordsError } = await supabase.rpc('create_call_records_if_not_exists');
    if (callRecordsError) throw callRecordsError;
    
    // Create sms_records table if it doesn't exist
    const { error: smsRecordsError } = await supabase.rpc('create_sms_records_if_not_exists');
    if (smsRecordsError) throw smsRecordsError;
    
    // Create letter_records table if it doesn't exist
    const { error: letterRecordsError } = await supabase.rpc('create_letter_records_if_not_exists');
    if (letterRecordsError) throw letterRecordsError;
    
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

// Execute this function to verify table setup
export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['communication_providers', 'call_records', 'sms_records', 'letter_records'])
      .eq('table_schema', 'public');
    
    if (tablesError) throw tablesError;
    
    const existingTables = tables.map(t => t.table_name);
    console.log('Existing tables:', existingTables);
    
    const missingTables = [
      'communication_providers', 
      'call_records', 
      'sms_records', 
      'letter_records'
    ].filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.warn('Missing tables:', missingTables);
      
      // If RPC functions are not available, create tables directly
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
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS communication_providers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('twilio', 'callrail')),
          is_default BOOLEAN DEFAULT false,
          config JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (error) throw error;
    }
    
    if (table === 'call_records') {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS call_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          provider_id UUID NOT NULL REFERENCES communication_providers(id) ON DELETE CASCADE,
          provider_type TEXT NOT NULL CHECK (provider_type IN ('twilio', 'callrail')),
          call_id TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          contact_name TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          duration INTEGER DEFAULT 0,
          recording_url TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (error) throw error;
    }
    
    if (table === 'sms_records') {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS sms_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          provider_id UUID NOT NULL REFERENCES communication_providers(id) ON DELETE CASCADE,
          sms_id TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          contact_name TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          message TEXT NOT NULL,
          direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (error) throw error;
    }
    
    if (table === 'letter_records') {
      const { error } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS letter_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          recipient TEXT NOT NULL,
          address TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          content TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'delivered')),
          tracking_number TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (error) throw error;
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
    const { count, error: countError } = await supabase
      .from('pg_indexes')
      .select('count(*)', { count: 'exact' })
      .eq('indexname', index.name);
      
    if (countError) {
      console.error(`Error checking index ${index.name}:`, countError);
      continue;
    }
    
    if (!count || count === 0) {
      console.log(`Creating index ${index.name}`);
      const { error } = await supabase.query(`
        CREATE INDEX IF NOT EXISTS ${index.name} ON ${index.table} (${index.column});
      `);
      
      if (error) {
        console.error(`Error creating index ${index.name}:`, error);
      }
    }
  }
}
