
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

// SQL creation statements for each table
const CREATE_TABLES_SQL = {
  communication_providers: `
    CREATE TABLE IF NOT EXISTS communication_providers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

// Create tables for direct use with insertions
async function createTablesWithInsertions() {
  const testId = '00000000-0000-0000-0000-000000000001';
  let successCount = 0;
  
  try {
    // Enable UUID extension if possible
    try {
      await supabase.rpc('exec_sql', { 
        sql_query: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' 
      });
    } catch (e) {
      console.log('Note: Could not create uuid-ossp extension, proceeding anyway');
    }
    
    // Create communication_providers table
    console.log('Creating communication_providers table with insertion');
    const { error: cpError } = await supabase.from('communication_providers').upsert({
      id: testId,
      user_id: 'system',
      name: 'Test Provider',
      type: 'twilio',
      is_default: true,
      config: {}
    });
    
    if (!cpError) successCount++;
    else console.error('Error creating communication_providers table:', cpError);
    
    // Create call_records table
    console.log('Creating call_records table with insertion');
    const { error: crError } = await supabase.from('call_records').upsert({
      id: testId,
      user_id: 'system',
      provider_id: 'system',
      provider_type: 'twilio',
      call_id: 'test-call',
      phone_number: '+11234567890',
      contact_name: 'Test Contact',
      timestamp: new Date().toISOString(),
      duration: 0
    });
    
    if (!crError) successCount++;
    else console.error('Error creating call_records table:', crError);
    
    // Create sms_records table
    console.log('Creating sms_records table with insertion');
    const { error: smError } = await supabase.from('sms_records').upsert({
      id: testId,
      user_id: 'system',
      provider_id: 'system',
      sms_id: 'test-sms',
      phone_number: '+11234567890',
      contact_name: 'Test Contact',
      timestamp: new Date().toISOString(),
      message: 'Test message',
      direction: 'outgoing'
    });
    
    if (!smError) successCount++;
    else console.error('Error creating sms_records table:', smError);
    
    // Create letter_records table
    console.log('Creating letter_records table with insertion');
    const { error: lrError } = await supabase.from('letter_records').upsert({
      id: testId,
      user_id: 'system',
      recipient: 'Test Recipient',
      timestamp: new Date().toISOString(),
      content: 'Test content',
      status: 'draft'
    });
    
    if (!lrError) successCount++;
    else console.error('Error creating letter_records table:', lrError);
    
    console.log(`Successfully created ${successCount} of 4 tables with insertions`);
    return successCount === 4;
  } catch (error) {
    console.error('Error in createTablesWithInsertions:', error);
    return false;
  }
}

// Retry function for operations
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
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
    
    console.log('Some tables missing, trying to create them...');
    
    // Step 2: Try creating tables with insertions (most reliable method)
    const insertionResult = await createTablesWithInsertions();
    
    if (insertionResult) {
      console.log('Successfully created all tables with insertions');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    toast({
      title: 'Database Setup Issue',
      description: 'There was a problem setting up the database. Please check console for details.',
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
