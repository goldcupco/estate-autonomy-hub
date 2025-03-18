
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { verifyTablesExist } from './utils/databaseVerification'
import { supabase, executeSql } from './utils/supabaseClient'
import { Toaster } from './components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from './components/ui/toast'

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a root and render the app with the Toaster component
createRoot(rootElement).render(
  <>
    <App />
    <Toaster />
  </>
);

// SQL statements for creating the tables
const CREATE_TABLES_SQL = `
-- Run this entire SQL block at once
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

-- Insert example data to verify tables work
INSERT INTO communication_providers (id, user_id, name, type, is_default, config)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system',
  'Example Twilio',
  'twilio',
  true,
  '{"accountSid": "ACexample", "authToken": "example-token", "twilioNumber": "+15555555555"}'
) ON CONFLICT (id) DO NOTHING;
`;

// Immediate initialization function to create tables directly
const initializeApplication = async () => {
  console.log('Starting database initialization...');
  
  try {
    // First check if tables already exist
    const { success, tableStatus } = await verifyTablesExist();
    
    if (success) {
      console.log('All tables already exist, no setup needed');
      toast({
        title: 'Database Ready',
        description: 'Connected to database successfully',
        variant: 'default'
      });
      return true;
    }
    
    // Tables don't exist, try to create them directly
    console.log('Tables missing, attempting to create them directly...');
    
    // Execute the SQL directly
    const result = await executeSql(CREATE_TABLES_SQL);
    
    if (result.success) {
      console.log('Successfully created all database tables');
      toast({
        title: 'Database Setup Complete',
        description: 'All required tables have been created successfully',
        variant: 'default'
      });
      return true;
    } else {
      console.error('Failed to create tables automatically:', result.error);
      
      // Show manual setup instructions as fallback
      console.error('=== MANUAL DATABASE SETUP REQUIRED ===');
      console.error('Please follow these steps to set up the database manually:');
      console.error('1. Go to: https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/database/tables');
      console.error('2. Click on "SQL Editor" in the left sidebar');
      console.error('3. Create a new query and paste the SQL below:');
      console.error(CREATE_TABLES_SQL);
      console.error('4. Click "Run" to execute the SQL');
      console.error('5. Refresh this application');
      
      // Display toast with SQL editor link
      toast({
        title: 'Database Setup Failed',
        description: 'Manual setup is required. Click to open SQL Editor.',
        variant: 'destructive',
        action: (
          <ToastAction 
            altText="Open SQL Editor" 
            onClick={() => window.open('https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/sql/new', '_blank')}
          >
            Open SQL Editor
          </ToastAction>
        ),
        duration: 30000
      });
      
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    toast({
      title: 'Critical Error',
      description: 'The application cannot start properly. Please contact support.',
      variant: 'destructive'
    });
    
    return false;
  }
};

// Start the initialization process immediately
initializeApplication();
