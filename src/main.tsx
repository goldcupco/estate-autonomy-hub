
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './utils/initializeApp'
import { Toaster } from './components/ui/toaster'
import { toast } from '@/hooks/use-toast'

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

// Immediate initialization function to avoid race conditions
const initializeApplication = async () => {
  console.log('Starting database initialization...');
  
  try {
    // Show a toast to let the user know initialization is happening
    toast({
      title: 'Initializing Application',
      description: 'Setting up the database connection...',
      variant: 'default'
    });
    
    const success = await initializeApp();
    console.log('Application initialization completed with status:', success ? 'SUCCESS' : 'FAILURE');
    
    // If initialization failed, show diagnostic information and instructions
    if (!success) {
      toast({
        title: 'Database Setup Issue',
        description: 'Tables could not be created automatically. Please check console for more information.',
        variant: 'destructive',
        duration: 10000 // Show longer for an important error
      });
      
      // Provide comprehensive debugging information with multiple SQL creation commands
      console.error('=== DATABASE SETUP FAILURE ===');
      console.error('Tables could not be created automatically.');
      console.error('Please manually create the required tables in the Supabase Dashboard:');
      console.error('https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/database/tables');
      console.error('');
      console.error('Copy and run these SQL commands in the SQL Editor:');
      console.error('');
      console.error(`CREATE TABLE IF NOT EXISTS communication_providers (
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
);`);
      console.error('============================');
      
      // Show an additional toast with link to Supabase
      toast({
        title: 'Manual Setup Required',
        description: 'Please visit the Supabase Dashboard to create tables manually.',
        variant: 'default',
        duration: 15000
      });
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    toast({
      title: 'Initialization Error',
      description: 'An unexpected error occurred. Please check console for details.',
      variant: 'destructive'
    });
  }
};

// Start the database initialization process immediately
initializeApplication();
