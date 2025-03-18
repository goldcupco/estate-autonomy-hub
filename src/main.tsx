
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
    
    // If initialization failed, try again after 3 seconds
    if (!success) {
      console.log('Trying initialization again in 3 seconds...');
      
      setTimeout(async () => {
        try {
          toast({
            title: 'Retrying Initialization',
            description: 'Making another attempt to set up the database...',
            variant: 'default'
          });
          
          const retrySuccess = await initializeApp();
          
          console.log('Retry initialization completed with status:', retrySuccess ? 'SUCCESS' : 'FAILURE');
          
          if (!retrySuccess) {
            // If still failing, show a more detailed error message with instructions
            toast({
              title: 'Database Setup Failed',
              description: 'Please check your Supabase project and ensure you have permission to create tables.',
              variant: 'destructive'
            });
            
            // Add a visible console message for debugging
            console.error('=== DATABASE SETUP FAILURE ===');
            console.error('Tables could not be created after multiple attempts.');
            console.error('Please check your Supabase project at:');
            console.error('https://supabase.com/dashboard/project/gdxzktqieasxxcocwsjh/');
            console.error('1. Ensure your project exists and is active');
            console.error('2. Check if you have permission to create tables');
            console.error('3. Try creating the tables manually in the SQL editor');
            console.error('============================');
          }
        } catch (retryError) {
          console.error('Failed retry initialization:', retryError);
          
          toast({
            title: 'Initialization Error',
            description: 'Failed to connect to database. Please check console for details.',
            variant: 'destructive'
          });
        }
      }, 3000);
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
