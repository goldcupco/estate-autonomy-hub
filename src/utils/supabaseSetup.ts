// Import the supabase client properly
import { supabase, safeFrom, executeSql, createTablesDirectly, isValidTableName, ValidTableName } from './supabaseClient';
import { toast } from '@/hooks/use-toast';
import { CREATE_TABLES_SQL } from './initializeApp';

// Helper function to type-check table names
function isValidTableName(tableName: string): tableName is 
  "call_records" | "leads" | "campaign_leads" | "campaigns" | "communication_providers" | 
  "contracts" | "documents" | "properties" | "letter_records" | "list_items" | 
  "lists" | "phone_numbers" | "sms_records" {
  
  const validTables = [
    "call_records", "leads", "campaign_leads", "campaigns", "communication_providers",
    "contracts", "documents", "properties", "letter_records", "list_items",
    "lists", "phone_numbers", "sms_records"
  ];
  
  return validTables.includes(tableName);
}

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
        // First check if it's a valid table name
        if (isValidTableName(table)) {
          // Use the Supabase client directly with properly typed table names
          const { data, error } = await supabase.from(table).select('*').limit(1);
          
          if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
            console.log(`Table ${table} does not exist`);
            missingTables.push(table);
          } else {
            console.log(`Table ${table} exists`);
            existingTables.push(table);
          }
        } else {
          // For tables not in the type system yet, use a more generic approach
          console.warn(`Table ${table} is not in the type system, using fallback check`);
          missingTables.push(table);
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
    
    // Try to create all tables using direct SQL
    try {
      const result = await createTablesDirectly();
      if (result.success) {
        console.log('Tables created successfully with direct SQL');
        return { success: true };
      }
    } catch (error) {
      console.error('Error creating tables with direct SQL:', error);
    }
    
    // If direct approach failed, try individual SQL statements
    for (const table of missingTables) {
      if (CREATE_TABLES_SQL[table]) {
        console.log(`Creating ${table} with direct SQL...`);
        await executeSql(CREATE_TABLES_SQL[table]);
      }
    }
    
    // Verify table creation
    const { success: verifySuccess, missingTables: stillMissing } = await verifyDatabaseSetup();
    
    if (verifySuccess) {
      console.log('All tables created successfully');
      return { success: true };
    }
    
    if (stillMissing.length > 0) {
      console.log('Some tables still missing after SQL creation, trying data insertion...');
      // Create records for missing tables using upsert approach
      try {
        // Generate a test ID for system records
        const testId = '00000000-0000-0000-0000-000000000000';
        
        // Try to create missing tables by inserting records
        for (const table of stillMissing) {
          switch (table) {
            case 'leads':
              await supabase.from('leads').upsert({
                id: testId,
                user_id: 'system',
                first_name: 'Test',
                last_name: 'User',
                lead_type: 'buyer',
                status: 'new'
              });
              break;
              
            case 'properties':
              await supabase.from('properties').upsert({
                id: testId,
                user_id: 'system',
                address: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zip: '12345',
                status: 'active'
              });
              break;
              
            case 'lists':
              await supabase.from('lists').upsert({
                id: testId,
                user_id: 'system',
                name: 'Test List',
                type: 'general'
              });
              break;
              
            case 'campaigns':
              await supabase.from('campaigns').upsert({
                id: testId,
                user_id: 'system',
                name: 'Test Campaign',
                status: 'draft',
                type: 'direct_mail',
                created_by: 'system'
              });
              break;
              
            case 'documents':
              await supabase.from('documents').upsert({
                id: testId,
                user_id: 'system',
                name: 'Test Document',
                file_path: '/test/document.pdf',
                file_type: 'pdf'
              });
              break;
              
            case 'phone_numbers':
              await supabase.from('phone_numbers').upsert({
                id: testId,
                user_id: 'system',
                phone_number: '+10000000000',
                status: 'active'
              });
              break;
              
            case 'contracts':
              await supabase.from('contracts').upsert({
                id: testId,
                user_id: 'system',
                title: 'Test Contract',
                contract_type: 'purchase',
                status: 'draft'
              });
              break;
              
            // For junction tables
            case 'list_items':
              await supabase.from('list_items').upsert({
                id: testId,
                list_id: testId,
                item_id: testId,
                item_type: 'lead'
              });
              break;
              
            case 'campaign_leads':
              await supabase.from('campaign_leads').upsert({
                id: testId,
                campaign_id: testId,
                lead_id: testId
              });
              break;
              
            // For communication-related tables
            case 'communication_providers':
              await supabase.from('communication_providers').upsert({
                id: testId,
                user_id: 'system',
                name: 'Default Provider',
                type: 'twilio',
                is_default: true,
                config: {}
              });
              break;
              
            case 'call_records':
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
              });
              break;
              
            case 'sms_records':
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
              });
              break;
              
            case 'letter_records':
              await supabase.from('letter_records').upsert({
                id: testId,
                user_id: 'system',
                recipient: 'System Test',
                timestamp: new Date().toISOString(),
                content: 'System test',
                status: 'draft'
              });
              break;
              
            default:
              console.log(`No handler for table ${table}`);
          }
        }
      } catch (error) {
        console.error('Error creating tables with record insertion:', error);
      }
    }
    
    // Final verification
    const finalCheck = await verifyDatabaseSetup();
    return { 
      success: finalCheck.success,
      missingTables: finalCheck.missingTables,
      error: finalCheck.success ? null : 'Failed to create all required tables' 
    };
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
