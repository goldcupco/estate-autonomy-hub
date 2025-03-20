
import { supabaseUrl, supabaseKey, safeFrom } from './supabaseClient';
import { verifyDatabaseSetup } from './supabaseSetup';

// Function to execute SQL statements directly
async function executeSQL(sql: string) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('SQL execution failed:', response.status, errorBody);
      return { success: false, error: errorBody };
    }

    return { success: true };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Function to insert data into a table
async function insertData(table: string, data: any) {
  try {
    // Use the safeFrom function to handle table names safely
    const { error } = await safeFrom(table).insert([data]);
    if (error) {
      console.error(`Failed to insert into ${table}:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Function to check if a table exists
async function tableExists(table: string): Promise<boolean> {
  try {
    const { error } = await safeFrom(table).select('*', { head: true, count: 'exact' });
    if (error) {
      if (error.message.includes('does not exist')) {
        return false;
      }
      console.error(`Error checking if table ${table} exists:`, error);
      return false;
    }
    return true;
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

    // Loop through each table and create it if it doesn't exist
    for (const table in CREATE_TABLES_SQL) {
      if (!await tableExists(table)) {
        console.log(`Creating table ${table}...`);
        const result = await executeSQL(CREATE_TABLES_SQL[table]);
        if (!result.success) {
          console.error(`Failed to create table ${table}:`, result.error);
          return { success: false, error: `Failed to create table ${table}: ${result.error}` };
        }
        console.log(`Table ${table} created successfully.`);
      } else {
        console.log(`Table ${table} already exists.`);
      }
    }

    console.log('Database initialized successfully.');
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
