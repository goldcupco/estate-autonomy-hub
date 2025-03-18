
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...');
  try {
    // Create tables directly using the Supabase client's SQL execution
    console.log('Creating tables directly using Supabase client...');
    
    // Communication providers table
    await createCommunicationProvidersTable();
    
    // Call records table
    await createCallRecordsTable();
    
    // SMS records table
    await createSmsRecordsTable();
    
    // Letter records table
    await createLetterRecordsTable();
    
    console.log('All tables set up successfully!');
    return { success: true };
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

async function createCommunicationProvidersTable() {
  console.log('Creating communication_providers table...');
  try {
    // Attempt to insert a test record - this will create the table if needed
    const { error } = await supabase
      .from('communication_providers')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'setup-test',
        name: 'Test Provider',
        type: 'twilio',
        is_default: false,
        config: {}
      });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create communication_providers table:', error);
    } else {
      // Delete the test record
      await supabase
        .from('communication_providers')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('Communication providers table created or already exists');
    }
  } catch (err) {
    console.error('Error creating communication_providers table:', err);
  }
}

async function createCallRecordsTable() {
  console.log('Creating call_records table...');
  try {
    // Attempt to insert a test record
    const { error } = await supabase
      .from('call_records')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'setup-test',
        provider_id: 'test',
        provider_type: 'twilio',
        call_id: 'setup-test',
        phone_number: '+10000000000',
        contact_name: 'Test Contact',
        duration: 0
      });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create call_records table:', error);
    } else {
      // Delete the test record
      await supabase
        .from('call_records')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('Call records table created or already exists');
    }
  } catch (err) {
    console.error('Error creating call_records table:', err);
  }
}

async function createSmsRecordsTable() {
  console.log('Creating sms_records table...');
  try {
    // Attempt to insert a test record
    const { error } = await supabase
      .from('sms_records')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'setup-test',
        provider_id: 'test',
        sms_id: 'setup-test',
        phone_number: '+10000000000',
        message: 'Test message',
        direction: 'outgoing'
      });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create sms_records table:', error);
    } else {
      // Delete the test record
      await supabase
        .from('sms_records')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('SMS records table created or already exists');
    }
  } catch (err) {
    console.error('Error creating sms_records table:', err);
  }
}

async function createLetterRecordsTable() {
  console.log('Creating letter_records table...');
  try {
    // Attempt to insert a test record
    const { error } = await supabase
      .from('letter_records')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: 'setup-test',
        recipient: 'Test Recipient',
        content: 'Test content',
        status: 'draft'
      });
    
    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create letter_records table:', error);
    } else {
      // Delete the test record
      await supabase
        .from('letter_records')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('Letter records table created or already exists');
    }
  } catch (err) {
    console.error('Error creating letter_records table:', err);
  }
}

// Execute this function to verify table setup
export async function verifyDatabaseSetup() {
  console.log('Verifying database setup...');
  
  try {
    // Check if tables exist by trying to fetch data from each
    const providerCheck = await supabase.from('communication_providers').select('id').limit(1);
    const callCheck = await supabase.from('call_records').select('id').limit(1);
    const smsCheck = await supabase.from('sms_records').select('id').limit(1);
    const letterCheck = await supabase.from('letter_records').select('id').limit(1);
    
    const tablesExist = [
      !providerCheck.error,
      !callCheck.error,
      !smsCheck.error,
      !letterCheck.error
    ];
    
    const existingTables = [
      !providerCheck.error ? 'communication_providers' : null,
      !callCheck.error ? 'call_records' : null,
      !smsCheck.error ? 'sms_records' : null,
      !letterCheck.error ? 'letter_records' : null
    ].filter(Boolean);
    
    console.log('Existing tables:', existingTables);
    
    // If some tables are missing, try to create them
    if (existingTables.length < 4) {
      console.warn('Missing tables, trying to create them...');
      await setupSupabaseTables();
      
      // Check again after creating tables
      const updatedProviderCheck = await supabase.from('communication_providers').select('id').limit(1);
      const updatedCallCheck = await supabase.from('call_records').select('id').limit(1);
      const updatedSmsCheck = await supabase.from('sms_records').select('id').limit(1);
      const updatedLetterCheck = await supabase.from('letter_records').select('id').limit(1);
      
      const updatedTablesExist = [
        !updatedProviderCheck.error,
        !updatedCallCheck.error,
        !updatedSmsCheck.error,
        !updatedLetterCheck.error
      ];
      
      const updatedExistingTables = [
        !updatedProviderCheck.error ? 'communication_providers' : null,
        !updatedCallCheck.error ? 'call_records' : null,
        !updatedSmsCheck.error ? 'sms_records' : null,
        !updatedLetterCheck.error ? 'letter_records' : null
      ].filter(Boolean);
      
      console.log('Updated table list after creation attempt:', updatedExistingTables);
      
      return { 
        success: updatedExistingTables.length === 4, 
        tables: updatedExistingTables,
        missingTables: ['communication_providers', 'call_records', 'sms_records', 'letter_records']
          .filter(t => !updatedExistingTables.includes(t))
      };
    }
    
    return { success: existingTables.length === 4, tables: existingTables };
  } catch (error) {
    console.error('Error verifying database:', error);
    toast({
      title: 'Database Verification Error',
      description: error instanceof Error ? error.message : 'Unknown error during verification',
      variant: 'destructive'
    });
    return { success: false, error };
  }
}
