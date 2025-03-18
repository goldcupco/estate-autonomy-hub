import { setupSupabaseTables, verifyDatabaseSetup } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';

export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // First verify and set up database tables and indexes
    console.log('Setting up database tables...');
    const setupResult = await setupSupabaseTables();
    
    if (setupResult.success) {
      console.log('Database tables created successfully');
    } else {
      console.error('Database table creation failed:', setupResult.error);
    }
    
    // Then verify the setup was successful
    const verifyResult = await verifyDatabaseSetup();
    
    if (verifyResult.success) {
      console.log('Database initialized successfully');
      console.log('Available tables:', verifyResult.tables);
    } else {
      console.error('Database initialization failed:', verifyResult.error);
      toast({
        title: 'Database Setup Issue',
        description: 'There was a problem setting up the database. Some features may not work correctly.',
        variant: 'destructive'
      });
    }
    
    return verifyResult.success;
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

// We no longer need this function as we're doing everything in initializeApp
// but keep it for backward compatibility
export async function initializeDatabase() {
  return initializeApp();
}
