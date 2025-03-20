
import { supabase, supabaseUrl } from './supabaseClient';

/**
 * Simple function to check if tables exist
 * This doesn't attempt to create tables - just verifies if they're present
 */
export async function verifyTablesExist() {
  console.log('Verifying if database tables exist...');
  
  const tables = ['communication_providers', 'call_records', 'sms_records', 'letter_records'];
  const tableStatus: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      // Check if table exists by attempting to select from it
      const { data, error } = await supabase
        .from(table as any)
        .select('*', { head: true, count: 'exact' });
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
        tableStatus[table] = false;
      } else {
        console.log(`✓ Table ${table} exists`);
        tableStatus[table] = true;
      }
    } catch (e) {
      console.error(`Failed to check table ${table}:`, e);
      tableStatus[table] = false;
    }
  }
  
  const allExist = Object.values(tableStatus).every(exists => exists);
  
  console.log('Database verification complete:');
  console.log('- All tables exist:', allExist);
  console.log('- Tables:', tableStatus);
  
  return {
    success: allExist,
    tableStatus,
    databaseUrl: supabaseUrl
  };
}
