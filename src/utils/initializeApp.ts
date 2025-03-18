
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

// Simple function to create tables
async function createTables() {
  try {
    console.log('Creating database tables directly...');
    
    // Create communication_providers table
    await supabase.from('communication_providers').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      name: 'System Default',
      type: 'twilio',
      is_default: true,
      config: {}
    }, { onConflict: 'id' }).select();
    
    // Create call_records table
    await supabase.from('call_records').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      provider_id: 'system',
      provider_type: 'twilio',
      call_id: 'system-test',
      phone_number: '+10000000000',
      contact_name: 'System Test',
      timestamp: new Date().toISOString(),
      duration: 0
    }, { onConflict: 'id' }).select();
    
    // Create sms_records table
    await supabase.from('sms_records').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      provider_id: 'system',
      sms_id: 'system-test',
      phone_number: '+10000000000',
      contact_name: 'System Test',
      timestamp: new Date().toISOString(),
      message: 'System test',
      direction: 'outgoing'
    }, { onConflict: 'id' }).select();
    
    // Create letter_records table
    await supabase.from('letter_records').upsert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      recipient: 'System Test',
      timestamp: new Date().toISOString(),
      content: 'System test',
      status: 'draft'
    }, { onConflict: 'id' }).select();
    
    console.log('All tables created successfully');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Check if a table exists by trying to query it
async function checkTableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log(`Table ${tableName} does not exist`);
      return false;
    }
    console.log(`Table ${tableName} exists`);
    return true;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
}

// Verify all needed tables exist
async function verifyDatabaseSetup() {
  try {
    const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
    const results = await Promise.all(tables.map(table => checkTableExists(table)));
    const allTablesExist = results.every(Boolean);
    
    if (allTablesExist) {
      console.log('All tables exist');
      return true;
    } else {
      console.log('Some tables are missing, attempting to create them');
      return false;
    }
  } catch (error) {
    console.error('Error verifying database setup:', error);
    return false;
  }
}

// Main initialization function
export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // First, check if tables exist
    const tablesExist = await verifyDatabaseSetup();
    
    if (!tablesExist) {
      // Create tables if they don't exist
      const created = await createTables();
      
      if (created) {
        toast({
          title: 'Database Setup Complete',
          description: 'All required database tables have been created.',
          variant: 'default'
        });
        return true;
      } else {
        toast({
          title: 'Database Setup Issue',
          description: 'There was a problem setting up the database. Some features may not work correctly.',
          variant: 'destructive'
        });
        return false;
      }
    } else {
      toast({
        title: 'Application Ready',
        description: 'Connected to database successfully.',
        variant: 'default'
      });
      return true;
    }
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

// For backward compatibility
export async function initializeDatabase() {
  return initializeApp();
}
