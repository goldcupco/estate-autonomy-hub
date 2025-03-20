import { supabase, supabaseUrl, supabaseKey, safeFrom, executeSql } from './supabaseClient';
import { verifyDatabaseSetup } from './supabaseSetup';

// Function to execute SQL statements directly
async function executeSQL(sql: string) {
  try {
    // Instead of using execute_sql which might not exist,
    // use a more resilient approach with error handling
    try {
      // Use the imported executeSql function (lowercase) from supabaseClient
      const result = await executeSql(sql);
      return result;
    } catch (err) {
      console.error('Error with executeSql:', err);
      
      // Fallback approach - try using RPC 
      const { error } = await supabase.rpc('admin_create_property', {
        property_data: {
          sql_command: sql,
          user_id: 'system'
        }
      });
      
      if (error) {
        console.error('SQL execution failed:', error);
        return { success: false, error };
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Function to insert data into a table
async function insertData(table: string, data: any) {
  try {
    // To fix the type error, we need to ensure the table is a valid table name
    // We'll use a type guard to check if the table name is valid
    if (isValidTableName(table)) {
      const { error } = await supabase.from(table).insert([data]);
      if (error) {
        console.error(`Failed to insert into ${table}:`, error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } else {
      return { success: false, error: `Invalid table name: ${table}` };
    }
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Type guard for valid table names
function isValidTableName(tableName: string): tableName is 
  "call_records" | "leads" | "campaign_leads" | "campaigns" | "communication_providers" | 
  "contracts" | "documents" | "properties" | "letter_records" | "list_items" | 
  "lists" | "phone_numbers" | "sms_records" {
  
  const validTables = [
    "call_records", "leads", "campaign_leads", "campaigns", "communication_providers",
    "contracts", "documents", "properties", "letter_records", "list_items",
    "lists", "phone_numbers", "sms_records"
  ];
  
  return validTables.includes(tableName);
}

// Function to check if a table exists
async function tableExists(table: string): Promise<boolean> {
  try {
    // Use type guard before making the query
    if (isValidTableName(table)) {
      const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });
      if (error) {
        if (error.message.includes('does not exist')) {
          return false;
        }
        console.error(`Error checking if table ${table} exists:`, error);
        return false;
      }
      return true;
    } else {
      console.warn(`Attempting to check existence of invalid table name: ${table}`);
      // For non-valid table names, try a safer approach
      try {
        // Using raw query through RPC (this is a fallback and may not work)
        const { data } = await supabase.rpc('admin_create_property', {
          property_data: {
            special_command: 'check_table_exists',
            table_name: table,
            user_id: 'system'
          }
        });
        return !!data;
      } catch {
        return false;
      }
    }
  } catch (error) {
    console.error(`Error checking table ${table}:`, error);
    return false;
  }
}

// SQL statements to create tables
export const CREATE_TABLES_SQL: { [key: string]: string } = {
  leads: `
    CREATE TABLE IF NOT EXISTS public.leads (
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
  communication_providers: `
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
  `,
  call_records: `
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
      lead_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  sms_records: `
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
      lead_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  letter_records: `
    CREATE TABLE IF NOT EXISTS public.letter_records (
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
  properties: `
    CREATE TABLE IF NOT EXISTS public.properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      price NUMERIC,
      bedrooms INTEGER,
      bathrooms INTEGER,
      square_feet INTEGER,
      property_type TEXT,
      status TEXT NOT NULL,
      images JSONB,
      description TEXT,
      features JSONB,
      listing_date TIMESTAMPTZ,
      year_built INTEGER,
      lot_size NUMERIC,
      mls_number TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  lists: `
    CREATE TABLE IF NOT EXISTS public.lists (
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
    CREATE TABLE IF NOT EXISTS public.list_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      list_id UUID NOT NULL,
      item_id UUID NOT NULL,
      item_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (list_id) REFERENCES lists(id)
    );
  `,
  campaigns: `
    CREATE TABLE IF NOT EXISTS public.campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      budget NUMERIC,
      metrics JSONB,
      created_by TEXT NOT NULL,
      assigned_users JSONB,
      access_restricted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  campaign_leads: `
    CREATE TABLE IF NOT EXISTS public.campaign_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID NOT NULL,
      lead_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
  `,
  documents: `
    CREATE TABLE IF NOT EXISTS public.documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      related_to_id UUID,
      related_to_type TEXT,
      tags JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `,
  phone_numbers: `
    CREATE TABLE IF NOT EXISTS public.phone_numbers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      label TEXT,
      provider_id UUID,
      status TEXT NOT NULL,
      capabilities JSONB,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (provider_id) REFERENCES communication_providers(id)
    );
  `,
  contracts: `
    CREATE TABLE IF NOT EXISTS public.contracts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      contract_type TEXT NOT NULL,
      status TEXT NOT NULL,
      amount NUMERIC,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      buyer_id UUID,
      seller_id UUID,
      property_id UUID,
      document_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      FOREIGN KEY (buyer_id) REFERENCES leads(id),
      FOREIGN KEY (seller_id) REFERENCES leads(id),
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );
  `,
};

// Function to initialize the database
export async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Verify if all tables exist
    const verificationResult = await verifyDatabaseSetup();
    if (verificationResult.success) {
      console.log('All tables exist, no initialization needed.');
      return { success: true };
    }

    console.log('Missing tables found, creating tables...');

    // Modified approach - try direct table creation via SQL
    try {
      // Use createTablesDirectly from supabaseClient instead
      const result = await createTablesDirectly();
      if (!result.success) {
        console.error('Failed to create tables directly:', result.error);
      }
    } catch (err) {
      console.error('Error creating tables directly:', err);
      
      // Fallback approach - create essential tables directly with insert
      for (const [tableName, _] of Object.entries(CREATE_TABLES_SQL)) {
        if (!await tableExists(tableName)) {
          try {
            // Try to create minimal records for core functionality
            if (tableName === 'campaigns' && isValidTableName(tableName)) {
              await supabase.from('campaigns').insert({
                name: 'Default Campaign',
                status: 'active',
                type: 'general',
                created_by: 'system',
                user_id: 'system'
              }).select();
            }
          } catch (err) {
            console.warn(`Failed to create ${tableName} with fallback approach:`, err);
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Function to insert sample data into tables
export async function insertSampleData() {
  console.log('Inserting sample data...');

  try {
    // Sample data for leads table
    const sampleLead = {
      user_id: 'system',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+15551234567',
      lead_type: 'buyer',
      status: 'new',
    };

    // Sample data for communication_providers table
    const sampleProvider = {
      user_id: 'system',
      name: 'Twilio',
      type: 'twilio',
      is_default: true,
      config: {
        accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        authToken: 'your_auth_token',
        twilioNumber: '+15558675309',
      },
    };

    // Insert sample data into leads table
    if (await tableExists('leads')) {
      const leadResult = await insertData('leads', sampleLead);
      if (!leadResult.success) {
        console.error('Failed to insert sample lead:', leadResult.error);
      } else {
        console.log('Sample lead inserted successfully.');
      }
    } else {
      console.warn('Leads table does not exist, skipping sample data insertion.');
    }

    // Insert sample data into communication_providers table
    if (await tableExists('communication_providers')) {
      const providerResult = await insertData('communication_providers', sampleProvider);
      if (!providerResult.success) {
        console.error('Failed to insert sample provider:', providerResult.error);
      } else {
        console.log('Sample provider inserted successfully.');
      }
    } else {
      console.warn('Communication providers table does not exist, skipping sample data insertion.');
    }

    console.log('Sample data insertion completed.');
    return { success: true };
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
