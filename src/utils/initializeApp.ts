
import { supabase, executeSql } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

// SQL creation statements for each table
export const CREATE_TABLES_SQL = {
  communication_providers: `
    CREATE TABLE IF NOT EXISTS communication_providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      is_default BOOLEAN DEFAULT false,
      config JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  call_records: `
    CREATE TABLE IF NOT EXISTS call_records (
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
  `,
  sms_records: `
    CREATE TABLE IF NOT EXISTS sms_records (
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
  `,
  letter_records: `
    CREATE TABLE IF NOT EXISTS letter_records (
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
  `
};

// Check if a table exists by trying to count records
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    const { error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log(`Table ${tableName} does not exist`);
      return false;
    }
    
    console.log(`Table ${tableName} exists`);
    return true;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
}

// Create tables using direct SQL execution
async function createTablesWithDirectSQL() {
  const results = [];
  const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
  
  // First enable pgcrypto for gen_random_uuid()
  try {
    await executeSql('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  } catch (e) {
    console.log('Could not create pgcrypto extension, proceeding anyway:', e);
  }
  
  // Try to create each table with SQL
  for (const table of tables) {
    console.log(`Creating ${table} table with SQL`);
    const sql = CREATE_TABLES_SQL[table];
    const result = await executeSql(sql);
    console.log(`Result of creating ${table}:`, result);
    results.push({ table, result });
  }
  
  // Check if tables were created successfully
  const successfulTables = [];
  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (exists) {
      successfulTables.push(table);
    }
  }
  
  return {
    success: successfulTables.length === tables.length,
    createdTables: successfulTables,
    results
  };
}

// Insert sample data to force table creation as fallback
async function insertSampleData() {
  try {
    const testId = '00000000-0000-0000-0000-000000000001';
    
    // Try to insert data in each table
    const results = [];
    
    // Insert into communication_providers
    results.push(await supabase.from('communication_providers').upsert({
      id: testId,
      user_id: 'system',
      name: 'Test Provider',
      type: 'twilio',
      is_default: true,
      config: {}
    }));
    
    // Insert into call_records
    results.push(await supabase.from('call_records').upsert({
      id: testId,
      user_id: 'system',
      provider_id: 'system',
      provider_type: 'twilio',
      call_id: 'test-call',
      phone_number: '+11234567890',
      contact_name: 'Test Contact',
      timestamp: new Date().toISOString(),
      duration: 0
    }));
    
    // Insert into sms_records
    results.push(await supabase.from('sms_records').upsert({
      id: testId,
      user_id: 'system',
      provider_id: 'system',
      sms_id: 'test-sms',
      phone_number: '+11234567890',
      contact_name: 'Test Contact',
      timestamp: new Date().toISOString(),
      message: 'Test message',
      direction: 'outgoing'
    }));
    
    // Insert into letter_records
    results.push(await supabase.from('letter_records').upsert({
      id: testId,
      user_id: 'system',
      recipient: 'Test Recipient',
      timestamp: new Date().toISOString(),
      content: 'Test content',
      status: 'draft'
    }));
    
    return { success: true, results };
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return { success: false, error };
  }
}

// Main initialization function with multiple strategies
export async function initializeApp() {
  console.log('Initializing application with direct approach...');
  
  try {
    // Step 1: Check existing tables
    const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
    const tableChecks = await Promise.all(tables.map(checkTableExists));
    const allTablesExist = tableChecks.every(Boolean);
    
    if (allTablesExist) {
      console.log('All tables already exist, no setup needed');
      toast({
        title: 'Application Ready',
        description: 'Connected to database successfully.',
        variant: 'default'
      });
      return true;
    }
    
    console.log('Some tables missing, trying to create them with direct SQL...');
    
    // Step 2: Try creating tables with direct SQL
    const sqlResult = await createTablesWithDirectSQL();
    
    if (sqlResult.success) {
      console.log('Successfully created all tables with direct SQL');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    console.log('Direct SQL approach failed, trying sample data insertion...');
    
    // Step 3: Try inserting sample data to force table creation
    const insertResult = await insertSampleData();
    
    if (insertResult.success) {
      // Verify that tables exist
      const verifyChecks = await Promise.all(tables.map(checkTableExists));
      const allExist = verifyChecks.every(Boolean);
      
      if (allExist) {
        console.log('Successfully created all tables with sample data insertion');
        toast({
          title: 'Database Setup Complete',
          description: 'All required database tables have been created successfully.',
          variant: 'default'
        });
        return true;
      }
    }
    
    console.error('Failed to create tables with all approaches');
    toast({
      title: 'Database Setup Issue',
      description: 'Unable to create database tables. Please check Supabase permissions.',
      variant: 'destructive'
    });
    return false;
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

// For backward compatibility
export async function initializeDatabase() {
  return initializeApp();
}
