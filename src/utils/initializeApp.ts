
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

// Check if a table exists by directly querying the information schema
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    console.log(`Checking if table ${tableName} exists in information_schema...`);
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`Error checking table in information_schema: ${error.message}`);
      
      // Fall back to more direct approach
      console.log(`Trying to select from ${tableName} directly...`);
      const { error: selectError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (selectError) {
        if (selectError.code === '42P01') { // Table does not exist error
          console.log(`Table ${tableName} does not exist (confirmed by error code)`);
          return false;
        }
        console.error(`Error checking table ${tableName}: ${selectError.message}`);
      } else {
        console.log(`Table ${tableName} exists (confirmed by successful query)`);
        return true;
      }
      
      return false;
    }
    
    const exists = data && data.length > 0;
    console.log(`Table ${tableName} ${exists ? 'exists' : 'does not exist'} (via information_schema)`);
    return exists;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
}

// Create tables using direct SQL execution with better error handling
async function createTablesWithDirectSQL() {
  const results = [];
  const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
  
  // First enable pgcrypto for gen_random_uuid()
  try {
    console.log('Enabling pgcrypto extension...');
    await executeSql('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('Successfully enabled pgcrypto extension');
  } catch (e) {
    console.error('Failed to create pgcrypto extension:', e);
    // Continue anyway, as it might already exist
  }
  
  // Try to create each table with SQL
  for (const table of tables) {
    console.log(`Creating ${table} table with SQL...`);
    try {
      const sql = CREATE_TABLES_SQL[table];
      const result = await executeSql(sql);
      console.log(`Result of creating ${table}:`, result);
      
      // Verify the table was actually created
      const exists = await checkTableExists(table);
      if (!exists) {
        console.error(`Failed to create ${table} table despite successful SQL execution`);
      } else {
        console.log(`Successfully created ${table} table`);
      }
      
      results.push({ table, success: exists, result });
    } catch (error) {
      console.error(`Error creating ${table} table:`, error);
      results.push({ table, success: false, error });
    }
  }
  
  // Check if tables were created successfully
  const successfulTables = [];
  const failedTables = [];
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    if (exists) {
      successfulTables.push(table);
    } else {
      failedTables.push(table);
    }
  }
  
  console.log(`Successfully created tables: ${successfulTables.join(', ') || 'none'}`);
  console.log(`Failed to create tables: ${failedTables.join(', ') || 'none'}`);
  
  return {
    success: successfulTables.length === tables.length,
    createdTables: successfulTables,
    failedTables,
    results
  };
}

// Insert sample data to force table creation as fallback
async function insertSampleData() {
  try {
    const testId = '00000000-0000-0000-0000-000000000001';
    const successfulTables = [];
    
    console.log('Trying to create tables by inserting sample data...');
    
    // Try to insert data in each table
    const results = [];
    
    // Insert into communication_providers
    try {
      console.log('Creating communication_providers with sample data...');
      const { error } = await supabase.from('communication_providers').upsert({
        id: testId,
        user_id: 'system',
        name: 'Test Provider',
        type: 'twilio',
        is_default: true,
        config: {}
      });
      
      if (error) {
        console.error('Failed to insert into communication_providers:', error);
      } else {
        console.log('Successfully inserted into communication_providers');
        successfulTables.push('communication_providers');
      }
      
      results.push({ table: 'communication_providers', success: !error, error });
    } catch (e) {
      console.error('Error inserting into communication_providers:', e);
      results.push({ table: 'communication_providers', success: false, error: e });
    }
    
    // Insert into call_records
    try {
      console.log('Creating call_records with sample data...');
      const { error } = await supabase.from('call_records').upsert({
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
      
      if (error) {
        console.error('Failed to insert into call_records:', error);
      } else {
        console.log('Successfully inserted into call_records');
        successfulTables.push('call_records');
      }
      
      results.push({ table: 'call_records', success: !error, error });
    } catch (e) {
      console.error('Error inserting into call_records:', e);
      results.push({ table: 'call_records', success: false, error: e });
    }
    
    // Insert into sms_records
    try {
      console.log('Creating sms_records with sample data...');
      const { error } = await supabase.from('sms_records').upsert({
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
      
      if (error) {
        console.error('Failed to insert into sms_records:', error);
      } else {
        console.log('Successfully inserted into sms_records');
        successfulTables.push('sms_records');
      }
      
      results.push({ table: 'sms_records', success: !error, error });
    } catch (e) {
      console.error('Error inserting into sms_records:', e);
      results.push({ table: 'sms_records', success: false, error: e });
    }
    
    // Insert into letter_records
    try {
      console.log('Creating letter_records with sample data...');
      const { error } = await supabase.from('letter_records').upsert({
        id: testId,
        user_id: 'system',
        recipient: 'Test Recipient',
        timestamp: new Date().toISOString(),
        content: 'Test content',
        status: 'draft'
      });
      
      if (error) {
        console.error('Failed to insert into letter_records:', error);
      } else {
        console.log('Successfully inserted into letter_records');
        successfulTables.push('letter_records');
      }
      
      results.push({ table: 'letter_records', success: !error, error });
    } catch (e) {
      console.error('Error inserting into letter_records:', e);
      results.push({ table: 'letter_records', success: false, error: e });
    }
    
    console.log(`Successfully created tables with sample data: ${successfulTables.join(', ') || 'none'}`);
    
    return { 
      success: successfulTables.length === 4, 
      createdTables: successfulTables, 
      results 
    };
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return { success: false, error };
  }
}

// Try to create tables using a different approach - creating SQL tables directly
async function createTablesWithRawSQL() {
  try {
    console.log('Attempting to create tables using raw SQL...');
    const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
    const successfulTables = [];
    
    for (const table of tables) {
      try {
        const sql = CREATE_TABLES_SQL[table];
        
        // Use a different approach to execute SQL
        const response = await fetch('https://gdxzktqieasxxcocwsjh.supabase.co/rest/v1/rpc/exec_sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY'
          },
          body: JSON.stringify({ sql_query: sql })
        });
        
        if (response.ok) {
          console.log(`Successfully created ${table} table with raw SQL approach`);
          
          // Verify table exists
          const exists = await checkTableExists(table);
          if (exists) {
            successfulTables.push(table);
          } else {
            console.error(`Table ${table} still doesn't exist after raw SQL creation`);
          }
        } else {
          const errorText = await response.text();
          console.error(`Failed to create ${table} table with raw SQL: ${errorText}`);
        }
      } catch (error) {
        console.error(`Error creating ${table} table with raw SQL:`, error);
      }
    }
    
    return {
      success: successfulTables.length === tables.length,
      createdTables: successfulTables
    };
  } catch (error) {
    console.error('Error in raw SQL table creation:', error);
    return { success: false, error };
  }
}

// Main initialization function with improved error handling and multiple strategies
export async function initializeApp() {
  console.log('Initializing application database...');
  
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
    
    const missingTables = tables.filter((_, index) => !tableChecks[index]);
    console.log(`Missing tables: ${missingTables.join(', ')}`);
    
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
    
    console.log('Direct SQL approach failed, trying raw SQL approach...');
    
    // Step 3: Try with raw SQL approach
    const rawSqlResult = await createTablesWithRawSQL();
    
    if (rawSqlResult.success) {
      console.log('Successfully created all tables with raw SQL approach');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    console.log('Raw SQL approach failed, trying sample data insertion...');
    
    // Step 4: Try inserting sample data to force table creation
    const insertResult = await insertSampleData();
    
    if (insertResult.success) {
      console.log('Successfully created all tables with sample data insertion');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    // If we got here, all approaches failed
    console.error('Failed to create tables with all approaches');
    
    // Display a more helpful error message with details on what went wrong
    toast({
      title: 'Database Setup Issue',
      description: 'Unable to create database tables. Please check Supabase permissions and configuration.',
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
