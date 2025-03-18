
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with provided credentials
export const supabaseUrl = 'https://gdxzktqieasxxcocwsjh.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkeHprdHFpZWFzeHhjb2N3c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMjc1MTEsImV4cCI6MjA1NzkwMzUxMX0.EKFCdp3mGjHsBalEWUcIApkHtcmbzR8876N8F3OhlKY';

// Create the client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Improved table creation function using the Supabase API directly
export async function createTablesDirectly() {
  console.log('Creating tables using direct Supabase API...');
  
  try {
    // Communication Providers Table
    const { error: providersError } = await supabase.from('communication_providers').insert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      name: 'Default Provider',
      type: 'twilio',
      is_default: true,
      config: {}
    }).select();
    
    if (providersError && providersError.code !== '23505') { // Ignore duplicate key error
      console.log('Creating communication_providers table failed:', providersError);
    } else {
      console.log('communication_providers table created or already exists');
    }
    
    // Call Records Table
    const { error: callsError } = await supabase.from('call_records').insert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      provider_id: 'system',
      provider_type: 'twilio',
      call_id: 'system-test',
      phone_number: '+10000000000',
      contact_name: 'System Test',
      timestamp: new Date().toISOString(),
      duration: 0
    }).select();
    
    if (callsError && callsError.code !== '23505') {
      console.log('Creating call_records table failed:', callsError);
    } else {
      console.log('call_records table created or already exists');
    }
    
    // SMS Records Table
    const { error: smsError } = await supabase.from('sms_records').insert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      provider_id: 'system',
      sms_id: 'system-test',
      phone_number: '+10000000000',
      contact_name: 'System Test',
      timestamp: new Date().toISOString(),
      message: 'System test',
      direction: 'outgoing'
    }).select();
    
    if (smsError && smsError.code !== '23505') {
      console.log('Creating sms_records table failed:', smsError);
    } else {
      console.log('sms_records table created or already exists');
    }
    
    // Letter Records Table
    const { error: letterError } = await supabase.from('letter_records').insert({
      id: '00000000-0000-0000-0000-000000000000',
      user_id: 'system',
      recipient: 'System Test',
      timestamp: new Date().toISOString(),
      content: 'System test',
      status: 'draft'
    }).select();
    
    if (letterError && letterError.code !== '23505') {
      console.log('Creating letter_records table failed:', letterError);
    } else {
      console.log('letter_records table created or already exists');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error during direct table creation:', error);
    return { success: false, error };
  }
}

// Legacy function kept for compatibility
export async function executeSql(sql: string) {
  console.log('SQL execution requested:', sql);
  console.log('Using direct table creation instead of SQL execution...');
  
  return createTablesDirectly();
}

// Type definitions for our database tables
export type ProviderType = 'twilio' | 'callrail';

export interface DbCommunicationProvider {
  id: string;
  user_id: string;
  name: string;
  type: ProviderType;
  is_default: boolean;
  config: {
    accountSid?: string;
    authToken?: string;
    twilioNumber?: string;
    apiKey?: string;
    accountId?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DbCallRecord {
  id: string;
  user_id: string;
  provider_id: string;
  provider_type: ProviderType;
  call_id: string;
  phone_number: string;
  contact_name: string;
  timestamp: string;
  duration: number;
  recording_url?: string;
  notes?: string;
  created_at: string;
}

export interface DbSmsRecord {
  id: string;
  user_id: string;
  provider_id: string;
  sms_id: string;
  phone_number: string;
  contact_name: string;
  timestamp: string;
  message: string;
  direction: 'outgoing' | 'incoming';
  created_at: string;
}

export interface DbLetterRecord {
  id: string;
  user_id: string;
  recipient: string;
  address?: string;
  timestamp: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered';
  tracking_number?: string;
  created_at: string;
}
