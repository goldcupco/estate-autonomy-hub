
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase, createTablesDirectly } from './utils/supabaseClient'
import { Toaster } from './components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { ToastAction } from './components/ui/toast'
import { Alert, AlertDescription } from './components/ui/alert'

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

// Immediately try to create tables using the improved method
(async () => {
  console.log('Starting database initialization...');
  
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
    
    // Try to create tables using the improved direct method
    const result = await createTablesDirectly();
    
    if (result.success) {
      console.log('Tables created successfully!');
      toast({
        title: 'Database Setup Complete',
        description: 'All required tables have been created successfully',
      });
    } else {
      console.error('Tables creation failed:', result.error || 'Unknown error');
      
      // Show error toast with detailed explanation
      toast({
        title: 'Table Creation Failed',
        description: 'Please go to the Supabase dashboard and create the tables manually.',
        variant: 'destructive',
        action: (
          <ToastAction 
            altText="Open Supabase" 
            onClick={() => window.open('https://app.supabase.com/project/gdxzktqieasxxcocwsjh/editor', '_blank')}
          >
            Open Supabase
          </ToastAction>
        ),
      });
      
      // Log helpful SQL to console for manual creation
      console.error('=== SQL FOR MANUAL TABLE CREATION ===');
      console.error(`
CREATE TABLE public.communication_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.call_records (
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

CREATE TABLE public.sms_records (
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

CREATE TABLE public.letter_records (
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
`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    toast({
      title: 'Database Error',
      description: 'Failed to initialize database tables.',
      variant: 'destructive'
    });
  }
})();
