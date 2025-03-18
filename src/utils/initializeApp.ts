
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

// Directly create tables with raw SQL
async function forceCreateTables() {
  console.log('Force creating tables via direct SQL insertion...');
  const results = [];
  
  for (const [tableName, sql] of Object.entries(CREATE_TABLES_SQL)) {
    try {
      console.log(`Creating table ${tableName}...`);
      
      // First try to create via SQL
      const result = await executeSql(sql);
      console.log(`SQL execution result for ${tableName}:`, result);
      
      if (!result.success) {
        // If SQL failed, try direct insertion
        console.log(`SQL creation failed for ${tableName}, trying direct insert...`);
        
        const dummyRecord = {
          id: '00000000-0000-0000-0000-000000000000',
          user_id: 'system',
          name: tableName === 'communication_providers' ? 'System' : undefined,
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
        
        console.log(`Inserting dummy record for ${tableName}:`, dummyRecord);
        
        const { error } = await supabase
          .from(tableName)
          .upsert(dummyRecord);
          
        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error(`Error inserting dummy record for ${tableName}:`, error);
          results.push({ table: tableName, success: false, error });
        } else {
          console.log(`Successfully created table ${tableName} via direct insert`);
          results.push({ table: tableName, success: true });
        }
      } else {
        console.log(`Successfully created table ${tableName} via SQL`);
        results.push({ table: tableName, success: true });
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
    
    const { error } = await supabase
      .from(tableName)
      .select('*', { head: true, count: 'exact' });
    
    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log(`Table ${tableName} does not exist`);
        return false;
      }
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Table ${tableName} exists`);
    return true;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
}

// Create SQL Edge Function if it doesn't exist
async function createSqlEdgeFunction() {
  try {
    console.log('Creating SQL execution Edge Function...');
    
    // Check if edge function already exists
    const { data: functions, error: listError } = await supabase.functions.list();
    
    if (listError) {
      console.error('Error listing functions:', listError);
      return { success: false, error: listError };
    }
    
    const sqlFunctionExists = functions?.some(f => f.name === 'execute-sql');
    
    if (sqlFunctionExists) {
      console.log('SQL execution Edge Function already exists');
      return { success: true };
    }
    
    // Attempt to create the function (this requires admin privileges)
    // This might not work in all environments but we'll try
    console.log('Attempting to create SQL execution Edge Function...');
    
    // Edge function deployment requires admin privileges,
    // so this is just a placeholder - would need to be done via Supabase Dashboard
    
    return { success: false, message: 'Edge Function creation requires admin privileges' };
  } catch (error) {
    console.error('Error creating Edge Function:', error);
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
    
    // Step 3: Try to create tables by force
    console.log('Creating missing tables...');
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
      description: `Unable to create required tables. Please check Supabase permissions and setup in the dashboard.`,
      variant: 'destructive'
    });
    
    // Create a more visible error in the console for debugging
    console.error('=== DATABASE SETUP FAILURE ===');
    console.error(`Missing tables: ${stillMissingTables.join(', ')}`);
    console.error('This could be due to:');
    console.error('1. Insufficient permissions in Supabase');
    console.error('2. SQL execution being blocked');
    console.error('3. Network connectivity issues');
    console.error('Please check your Supabase dashboard and ensure the tables exist.');
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
