
import { supabase, executeSql } from './supabaseClient';
import { toast } from '@/hooks/use-toast';
import { CREATE_TABLES_SQL } from './initializeApp';

// This function verifies database setup by checking if tables exist
export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Check for all core tables
    const tables = [
      'communication_providers', 
      'call_records', 
      'sms_records', 
      'letter_records',
      'leads',
      'properties',
      'lists',
      'list_items',
      'campaigns',
      'campaign_leads',
      'documents',
      'phone_numbers',
      'contracts'
    ];
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

// This function creates tables with direct SQL and sample data
export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    const { success, missingTables } = await verifyDatabaseSetup();
    
    if (success) {
      console.log('All tables already exist, no setup needed');
      return { success: true };
    }
    
    console.log('Missing tables, trying to create them with direct SQL...');
    
    // Try to create the missing tables with direct SQL
    for (const table of missingTables) {
      if (CREATE_TABLES_SQL[table]) {
        console.log(`Creating ${table} with direct SQL...`);
        await executeSql(CREATE_TABLES_SQL[table]);
      }
    }
    
    // Verify table creation
    const { success: verifySuccess, missingTables: stillMissing } = await verifyDatabaseSetup();
    
    if (verifySuccess) {
      console.log('All tables created successfully with direct SQL');
      return { success: true };
    }
    
    if (stillMissing.length > 0) {
      console.log('Some tables still missing after SQL creation, trying data insertion...');
      // Create a UUID for our test records
      const testId = '00000000-0000-0000-0000-000000000000';
      
      // Create tables by upserting test records
      try {
        if (stillMissing.includes('leads')) {
          console.log('Creating leads table...');
          await supabase.from('leads').upsert({
            id: testId,
            user_id: 'system',
            first_name: 'Test',
            last_name: 'User',
            lead_type: 'buyer',
            status: 'new'
          }, { onConflict: 'id' });
        }
        
        if (stillMissing.includes('communication_providers')) {
          console.log('Creating communication_providers table...');
          await supabase.from('communication_providers').upsert({
            id: testId,
            user_id: 'system',
            name: 'System Default',
            type: 'twilio',
            is_default: true,
            config: {}
          }, { onConflict: 'id' });
        }
        
        if (stillMissing.includes('call_records')) {
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
        }
        
        if (stillMissing.includes('sms_records')) {
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
        }
        
        if (stillMissing.includes('letter_records')) {
          console.log('Creating letter_records table...');
          await supabase.from('letter_records').upsert({
            id: testId,
            user_id: 'system',
            recipient: 'System Test',
            timestamp: new Date().toISOString(),
            content: 'System test',
            status: 'draft'
          }, { onConflict: 'id' });
        }
        
        // Final verification
        const { success: finalSuccess } = await verifyDatabaseSetup();
        if (finalSuccess) {
          console.log('All tables created successfully after multiple attempts');
          return { success: true };
        }
      } catch (error) {
        console.error('Error creating tables with data insertion:', error);
      }
    }
    
    console.error('Failed to create tables after multiple attempts');
    return { success: false, error: 'Failed to create required tables' };
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
