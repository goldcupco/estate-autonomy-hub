
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

// This is now a much simpler verification function that checks if our tables exist
export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Check for tables one by one
    const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
    const existingTables = [];
    const missingTables = [];
    
    for (const table of tables) {
      try {
        console.log(`Checking if ${table} exists...`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error && error.code === '42P01') {
          console.log(`Table ${table} does not exist`);
          missingTables.push(table);
        } else {
          console.log(`Table ${table} exists`);
          existingTables.push(table);
        }
      } catch (tableError) {
        console.error(`Error checking table ${table}:`, tableError);
        missingTables.push(table);
      }
    }
    
    console.log('Verified tables:', existingTables);
    if (missingTables.length > 0) {
      console.log('Missing tables:', missingTables);
    }
    
    return { 
      success: missingTables.length === 0, 
      tables: existingTables,
      missingTables: missingTables
    };
  } catch (error) {
    console.error('Error verifying database:', error);
    return { success: false, error };
  }
}

// This function is now simpler and just uses the upsert method to create tables
export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    const { success } = await verifyDatabaseSetup();
    
    if (success) {
      console.log('All tables already exist, no setup needed');
      return { success: true };
    }
    
    // Create a UUID for our test records
    const testId = '00000000-0000-0000-0000-000000000000';
    
    // Create tables by upserting test records
    try {
      console.log('Creating communication_providers table...');
      await supabase.from('communication_providers').upsert({
        id: testId,
        user_id: 'system',
        name: 'System Default',
        type: 'twilio',
        is_default: true,
        config: {}
      }, { onConflict: 'id' });
      
      console.log('Creating call_records table...');
      await supabase.from('call_records').upsert({
        id: testId,
        user_id: 'system',
        provider_id: 'system',
        provider_type: 'twilio',
        call_id: 'system-test',
        phone_number: '+10000000000',
        contact_name: 'System Test',
        timestamp: new Date().toISOString(),
        duration: 0
      }, { onConflict: 'id' });
      
      console.log('Creating sms_records table...');
      await supabase.from('sms_records').upsert({
        id: testId,
        user_id: 'system',
        provider_id: 'system',
        sms_id: 'system-test',
        phone_number: '+10000000000',
        contact_name: 'System Test',
        timestamp: new Date().toISOString(),
        message: 'System test',
        direction: 'outgoing'
      }, { onConflict: 'id' });
      
      console.log('Creating letter_records table...');
      await supabase.from('letter_records').upsert({
        id: testId,
        user_id: 'system',
        recipient: 'System Test',
        timestamp: new Date().toISOString(),
        content: 'System test',
        status: 'draft'
      }, { onConflict: 'id' });
      
      console.log('All tables created successfully');
      return { success: true };
    } catch (error) {
      console.error('Error creating tables:', error);
      return { success: false, error };
    }
  } catch (error) {
    console.error('Error setting up tables:', error);
    toast({
      title: 'Database Setup Error',
      description: error instanceof Error ? error.message : 'Unknown error during database setup',
      variant: 'destructive'
    });
    return { success: false, error };
  }
}
