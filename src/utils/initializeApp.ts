
import { setupSupabaseTables, verifyDatabaseSetup } from './supabaseSetup';
import { toast } from '@/hooks/use-toast';
import { supabase } from './supabaseClient';

// Try to execute any SQL directly to create tables
async function createTablesWithSQL() {
  try {
    console.log('Attempting to create tables with direct SQL...');
    
    // Communication providers table
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS communication_providers (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          is_default BOOLEAN NOT NULL DEFAULT false,
          config JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Call records table
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS call_records (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          provider_type TEXT NOT NULL,
          call_id TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          contact_name TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          duration INTEGER NOT NULL,
          recording_url TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // SMS records table
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sms_records (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          provider_id TEXT NOT NULL,
          sms_id TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          contact_name TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          message TEXT NOT NULL,
          direction TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Letter records table
    await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS letter_records (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          recipient TEXT NOT NULL,
          address TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          content TEXT NOT NULL,
          status TEXT NOT NULL,
          tracking_number TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    return true;
  } catch (error) {
    console.log('SQL execution error or not permitted:', error);
    return false;
  }
}

export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // First try to create tables with direct SQL if possible
    const sqlResult = await createTablesWithSQL();
    if (sqlResult) {
      console.log('Tables created successfully with SQL');
    }
    
    // Then try the standard approach
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
      
      // Show success toast
      toast({
        title: 'Database Setup Complete',
        description: 'All required database tables are available.',
        variant: 'default'
      });
    } else {
      console.error('Database initialization failed:', verifyResult.error || 'Unknown error');
      
      if (verifyResult.missingTables && verifyResult.missingTables.length > 0) {
        console.error('Missing tables:', verifyResult.missingTables);
      }
      
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
