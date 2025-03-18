
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
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

// Simple SQL statements for creating the tables - without using functions
const CREATE_TABLES_SQL = `
-- Create communication_providers table
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

-- Create call_records table
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

-- Create sms_records table
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

-- Create letter_records table
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
`;

// Immediate direct table creation without unnecessary checks
(async () => {
  console.log('Starting direct table creation...');
  
  try {
    // Check if tables already exist by trying to query communication_providers
    const { data, error } = await supabase
      .from('communication_providers')
      .select('count(*)', { count: 'exact', head: true });
    
    // If we can query successfully, tables exist
    if (!error) {
      console.log('Tables already exist, no creation needed');
      toast({
        title: 'Database Ready',
        description: 'Connected to database successfully',
      });
      return;
    }
    
    console.log('Tables do not exist, creating them now...');
    
    // Direct SQL execution - split into individual CREATE statements
    const tableStatements = CREATE_TABLES_SQL.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && stmt.toLowerCase().includes('create table'));
    
    // Execute each CREATE TABLE statement separately
    for (const statement of tableStatements) {
      console.log(`Executing: ${statement}`);
      await executeSql(statement + ';');
    }
    
    // Verify if tables were created
    const verifyResult = await supabase
      .from('communication_providers')
      .select('count(*)', { count: 'exact', head: true });
    
    if (!verifyResult.error) {
      console.log('Tables created successfully!');
      toast({
        title: 'Database Setup Complete',
        description: 'All required tables have been created successfully',
      });
    } else {
      console.error('Tables creation failed:', verifyResult.error);
      toast({
        title: 'Database Setup Failed',
        description: 'Please create tables manually in Supabase SQL Editor',
        variant: 'destructive',
        action: (
          <ToastAction 
            altText="Open SQL Editor" 
            onClick={() => window.open('https://app.supabase.com/project/gdxzktqieasxxcocwsjh/sql/new', '_blank')}
          >
            Open SQL Editor
          </ToastAction>
        ),
        duration: 30000
      });
      
      // Log the full SQL script for easy copy-paste
      console.error('=== COPY THIS SQL TO CREATE TABLES MANUALLY ===');
      console.error(CREATE_TABLES_SQL);
      console.error('=============================================');
    }
  } catch (error) {
    console.error('Error creating tables:', error);
    toast({
      title: 'Database Error',
      description: 'Failed to create tables. Please try manual setup.',
      variant: 'destructive'
    });
  }
})();
