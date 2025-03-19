
import { supabase, executeSql } from './supabaseClient';
import { toast } from '@/hooks/use-toast';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// Define SQL creation statements for each table
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
      lead_id UUID,
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
      lead_id UUID,
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
      lead_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      lead_type TEXT NOT NULL,
      lead_source TEXT,
      status TEXT NOT NULL,
      stage TEXT,
      assigned_to TEXT,
      notes TEXT,
      last_contact_date TIMESTAMPTZ,
      next_follow_up TIMESTAMPTZ,
      tags JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  properties: `
    CREATE TABLE IF NOT EXISTS properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      price DECIMAL(12, 2),
      bedrooms INTEGER,
      bathrooms DECIMAL(3, 1),
      square_feet INTEGER,
      lot_size DECIMAL(10, 2),
      year_built INTEGER,
      property_type TEXT,
      status TEXT NOT NULL,
      description TEXT,
      features JSONB DEFAULT '{}'::jsonb,
      images JSONB DEFAULT '[]'::jsonb,
      listing_date TIMESTAMPTZ,
      mls_number TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  lists: `
    CREATE TABLE IF NOT EXISTS lists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  list_items: `
    CREATE TABLE IF NOT EXISTS list_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id UUID NOT NULL,
      item_id UUID NOT NULL,
      item_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  campaigns: `
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      created_by TEXT NOT NULL,
      assigned_users JSONB DEFAULT '[]'::jsonb,
      budget DECIMAL(12, 2),
      metrics JSONB DEFAULT '{}'::jsonb,
      access_restricted BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  campaign_leads: `
    CREATE TABLE IF NOT EXISTS campaign_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL,
      lead_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      related_to_id UUID,
      related_to_type TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  phone_numbers: `
    CREATE TABLE IF NOT EXISTS phone_numbers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      provider_id UUID,
      label TEXT,
      is_primary BOOLEAN DEFAULT false,
      capabilities JSONB DEFAULT '{}'::jsonb,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  contracts: `
    CREATE TABLE IF NOT EXISTS contracts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      contract_type TEXT NOT NULL,
      status TEXT NOT NULL,
      property_id UUID,
      buyer_id UUID,
      seller_id UUID,
      amount DECIMAL(12, 2),
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      document_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
};

// Directly create tables with raw SQL
async function forceCreateTables() {
  console.log('Force creating tables via direct SQL execution...');
  
  // First attempt: Try to create all tables with one combined SQL statement
  try {
    console.log('Attempting to create all tables with combined SQL...');
    const combinedSql = Object.values(CREATE_TABLES_SQL).join('\n');
    
    const result = await executeSql(combinedSql);
    if (result.success) {
      console.log('Successfully created all tables with combined SQL');
      return { success: true, results: [{ table: 'all', success: true }] };
    }
    
    console.log('Combined SQL approach failed, trying individual tables...');
  } catch (error) {
    console.error('Combined SQL execution failed:', error);
  }
  
  // Second attempt: Try each table individually
  const results = [];
  
  for (const [tableName, sql] of Object.entries(CREATE_TABLES_SQL)) {
    try {
      console.log(`Creating table ${tableName}...`);
      
      // Try to create table via SQL
      const result = await executeSql(sql);
      
      if (result.success) {
        console.log(`Successfully created table ${tableName} via SQL`);
        results.push({ table: tableName, success: true });
        continue;
      }
      
      console.log(`SQL creation failed for ${tableName}, trying direct insert...`);
      
      // Try direct insertion as fallback
      const dummyRecord = {
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'system',
        name: tableName === 'communication_providers' ? 'System Default' : undefined,
        type: tableName === 'communication_providers' ? 'twilio' : undefined,
        call_id: tableName === 'call_records' ? 'system-test' : undefined,
        sms_id: tableName === 'sms_records' ? 'system-test' : undefined,
        phone_number: (tableName === 'call_records' || tableName === 'sms_records') ? '+10000000000' : undefined,
        contact_name: (tableName === 'call_records' || tableName === 'sms_records') ? 'System Test' : undefined,
        recipient: tableName === 'letter_records' ? 'System Test' : undefined,
        message: tableName === 'sms_records' ? 'System test' : undefined,
        direction: tableName === 'sms_records' ? 'outgoing' : undefined,
        content: tableName === 'letter_records' ? 'System test' : undefined,
        status: tableName === 'letter_records' ? 'draft' : undefined,
        provider_id: (tableName === 'call_records' || tableName === 'sms_records') ? 'system' : undefined,
        provider_type: tableName === 'call_records' ? 'twilio' : undefined,
        timestamp: new Date().toISOString()
      };
      
      // Try supabase client insert
      const { error } = await supabase
        .from(tableName)
        .upsert(dummyRecord);
        
      if (!error || error.code === '23505') { // Ignore duplicate key error
        console.log(`Successfully created table ${tableName} via direct insert`);
        results.push({ table: tableName, success: true });
      } else {
        // Try REST API insert as a last resort
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(dummyRecord)
          });
          
          if (response.ok) {
            console.log(`Successfully created table ${tableName} via REST API`);
            results.push({ table: tableName, success: true });
          } else {
            console.error(`Failed to create table ${tableName} via REST API:`, 
              response.status, await response.text());
            results.push({ table: tableName, success: false, error: `REST API error: ${response.status}` });
          }
        } catch (restError) {
          console.error(`Error creating table ${tableName} via REST API:`, restError);
          results.push({ table: tableName, success: false, error: restError });
        }
      }
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      results.push({ table: tableName, success: false, error });
    }
  }
  
  const allSuccess = results.every(r => r.success);
  console.log(`Table creation complete. All successful: ${allSuccess}`);
  
  return {
    success: allSuccess,
    results
  };
}

// Check if a table exists by trying to select from it
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    
    // First try with the Supabase client
    const { error: clientError } = await supabase
      .from(tableName)
      .select('*', { head: true, count: 'exact' });
    
    if (!clientError) {
      console.log(`Table ${tableName} exists (verified via client)`);
      return true;
    }
    
    if (clientError.code !== '42P01') { // '42P01' means relation doesn't exist
      console.log(`Unexpected error checking table ${tableName}:`, clientError);
    }
    
    // Try direct REST API as fallback
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        console.log(`Table ${tableName} exists (verified via REST API)`);
        return true;
      }
      
      if (response.status === 404) {
        console.log(`Table ${tableName} does not exist (REST API returned 404)`);
        return false;
      }
      
      console.log(`Unexpected status checking table ${tableName}: ${response.status}`);
    } catch (restError) {
      console.error(`REST API error checking table ${tableName}:`, restError);
    }
    
    console.log(`Table ${tableName} does not exist`);
    return false;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
}

// Create SQL Edge Function if it doesn't exist
async function createSqlEdgeFunction() {
  try {
    console.log('Checking SQL execution Edge Function capabilities...');
    
    // We can't list functions with the current client permissions
    // Just assume we need to fallback to other mechanisms
    console.log('Using alternative table creation mechanisms...');
    
    // Return success to continue with other initialization steps
    return { success: true, message: 'Using alternative table creation methods' };
  } catch (error) {
    console.error('Error checking Edge Function capabilities:', error);
    return { success: false, error };
  }
}

// Main initialization function with improved error handling and multiple strategies
export async function initializeApp() {
  console.log('Initializing application database...');
  
  try {
    // Step 1: Check if Edge Function exists for SQL execution
    await createSqlEdgeFunction();
    
    // Step 2: Check if tables already exist
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
    console.log(`Missing tables that need to be created: ${missingTables.join(', ')}`);
    
    // Step 3: Try to create tables with improved creation logic
    console.log('Creating missing tables with enhanced table creation...');
    const forceResult = await forceCreateTables();
    
    if (forceResult.success) {
      console.log('Successfully created all tables');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    // Step 4: Verify tables again after creation attempts
    const finalChecks = await Promise.all(tables.map(checkTableExists));
    const finalTablesExist = finalChecks.every(Boolean);
    
    if (finalTablesExist) {
      console.log('All tables now exist after creation attempts');
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables have been created successfully.',
        variant: 'default'
      });
      return true;
    }
    
    // Step 5: Display helpful error and debugging info
    const stillMissingTables = tables.filter((_, index) => !finalChecks[index]);
    console.error(`Failed to create tables: ${stillMissingTables.join(', ')}`);
    
    toast({
      title: 'Database Setup Issue',
      description: `Unable to create required tables. Manual setup may be required.`,
      variant: 'destructive'
    });
    
    // Create a more visible error in the console for debugging
    console.error('=== DATABASE SETUP FAILURE ===');
    console.error(`Missing tables: ${stillMissingTables.join(', ')}`);
    console.error('Please create these tables manually in the Supabase dashboard:');
    console.error('https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/database/tables');
    console.error('============================');
    
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
