
import { verifyDatabaseSetup } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';

export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
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
