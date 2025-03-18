
import { verifyDatabaseSetup } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';

export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // Call this function immediately
    initializeDatabase();
    
    // Verify and set up database tables and indexes
    const result = await verifyDatabaseSetup();
    
    if (result.success) {
      console.log('Database initialized successfully');
    } else {
      console.error('Database initialization failed:', result.error);
      toast({
        title: 'Database Setup Issue',
        description: 'There was a problem setting up the database. Some features may not work correctly.',
        variant: 'destructive'
      });
    }
    
    return result.success;
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

// Function to ensure database is initialized
export async function initializeDatabase() {
  console.log('Setting up database tables...');
  try {
    const result = await verifyDatabaseSetup();
    console.log('Database setup result:', result);
    return result;
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error };
  }
}

// Automatically initialize database when this module is imported
initializeDatabase().catch(error => {
  console.error('Failed to initialize database on import:', error);
});
