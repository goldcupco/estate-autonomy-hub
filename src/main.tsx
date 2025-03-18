
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './utils/initializeApp'
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

// Immediate initialization function to avoid race conditions
const initializeApplication = async () => {
  console.log('Starting database initialization...');
  
  try {
    // Show a toast to let the user know initialization is happening
    toast({
      title: 'Database Connection Issue',
      description: 'The application cannot create tables automatically. Manual setup is required.',
      variant: 'destructive',
      duration: 10000
    });
    
    // Skip automatic table creation - show manual setup instructions instead
    console.error('=== IMPORTANT: MANUAL DATABASE SETUP REQUIRED ===');
    console.error('The application cannot create tables automatically. Please follow these steps:');
    console.error('1. Go to: https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/database/tables');
    console.error('2. Click on "SQL Editor" in the left sidebar');
    console.error('3. Create a new query and paste ALL of the following SQL:');
    console.error('');
    console.error(`-- Run this entire SQL block at once
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
) ON CONFLICT (id) DO NOTHING;`);
    console.error('');
    console.error('4. Click "Run" and ensure you see "Success, no rows returned"');
    console.error('5. Refresh this application');
    console.error('==============================================');
    
    // Display more prominent toasts with instructions
    toast({
      title: 'Manual Setup Instructions',
      description: 'Please check the console (F12) for step-by-step instructions.',
      variant: 'destructive',
      duration: 20000
    });
    
    // Display URL for SQL editor
    setTimeout(() => {
      toast({
        title: 'Supabase SQL Editor',
        description: 'Open SQL Editor to create tables manually',
        variant: 'default',
        action: (
          <ToastAction 
            altText="Open SQL Editor"
            onClick={() => window.open('https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/sql/new', '_blank')}
          >
            Open Editor
          </ToastAction>
        ),
        duration: 30000
      });
    }, 2000);
    
    return false;
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
