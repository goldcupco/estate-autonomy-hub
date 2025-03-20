import { supabase } from '@/integrations/supabase/client';
import { DbCommunicationProvider, DbCallRecord, DbSmsRecord, SmsRecord, mapProviderData } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

// Get all communication providers for the current user
export async function getCommunicationProviders(userId: string): Promise<DbCommunicationProvider[]> {
  try {
    const { data, error } = await supabase
      .from('communication_providers')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching communication providers:', error);
      throw error;
    }
    
    // Map the data to our DbCommunicationProvider type
    return data.map(provider => mapProviderData(provider));
  } catch (error) {
    console.error('Error in getCommunicationProviders:', error);
    throw error;
  }
}

// Get default communication provider for the current user
export async function getDefaultCommunicationProvider(userId: string): Promise<DbCommunicationProvider | null> {
  try {
    const { data, error } = await supabase
      .from('communication_providers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching default communication provider:', error);
      throw error;
    }
    
    if (!data) {
      // If there's no default provider, get the first one available
      const providers = await getCommunicationProviders(userId);
      return providers.length > 0 ? providers[0] : null;
    }
    
    // Map the data to our DbCommunicationProvider type
    return mapProviderData(data);
  } catch (error) {
    console.error('Error in getDefaultCommunicationProvider:', error);
    throw error;
  }
}

// Create a new communication provider
export async function createCommunicationProvider(
  userId: string,
  name: string,
  type: string,
  isDefault: boolean,
  config: any
): Promise<DbCommunicationProvider> {
  try {
    const { data, error } = await supabase
      .from('communication_providers')
      .insert([
        {
          user_id: userId,
          name: name,
          type: type,
          is_default: isDefault,
          config: config
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating communication provider:', error);
      throw error;
    }
    
    // Map the data to our DbCommunicationProvider type
    return mapProviderData(data);
  } catch (error) {
    console.error('Error in createCommunicationProvider:', error);
    throw error;
  }
}

// Update an existing communication provider
export async function updateCommunicationProvider(
  providerId: string,
  name: string,
  type: string,
  isDefault: boolean,
  config: any
): Promise<DbCommunicationProvider> {
  try {
    const { data, error } = await supabase
      .from('communication_providers')
      .update({
        name: name,
        type: type,
        is_default: isDefault,
        config: config
      })
      .eq('id', providerId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating communication provider:', error);
      throw error;
    }
    
    // Map the data to our DbCommunicationProvider type
    return mapProviderData(data);
  } catch (error) {
    console.error('Error in updateCommunicationProvider:', error);
    throw error;
  }
}

// Delete a communication provider
export async function deleteCommunicationProvider(providerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('communication_providers')
      .delete()
      .eq('id', providerId);
    
    if (error) {
      console.error('Error deleting communication provider:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCommunicationProvider:', error);
    throw error;
  }
}

// Make a phone call
export async function makeCall(
  userId: string,
  phoneNumber: string,
  contactName: string,
  providerId: string,
  providerType: string
): Promise<{ callId: string }> {
  try {
    // For now, we'll implement a simple simulation of a call
    // In a real app, this would integrate with Twilio or another provider
    
    // Get provider details if provided
    let provider = null;
    if (providerId) {
      const { data, error } = await supabase
        .from('communication_providers')
        .select('*')
        .eq('id', providerId)
        .single();
      
      if (error) throw error;
      provider = mapProviderData(data);
    }
    
    // Call the edge function (if we had one)
    // For now we'll just simulate it
    const { data, error } = await supabase
      .functions
      .invoke('make-call', {
        body: {
          phoneNumber,
          contactName,
          providerId,
          providerType
        }
      });
    
    if (error) throw error;
    
    // Save call record to database
    const callRecord = {
      user_id: userId,
      provider_id: providerId,
      provider_type: providerType,
      call_id: data?.callId || uuidv4(), // Fallback to generated ID if edge function doesn't return one
      phone_number: phoneNumber,
      contact_name: contactName,
      timestamp: new Date().toISOString(),
      duration: 0 // Call just started
    };
    
    const { error: insertError } = await supabase
      .from('call_records')
      .insert(callRecord);
    
    if (insertError) throw insertError;
    
    return { callId: callRecord.call_id };
  } catch (error) {
    console.error('Error making call:', error);
    throw error;
  }
}

// Get call records for the current user
export async function getCallRecords(userId: string): Promise<DbCallRecord[]> {
  try {
    const { data, error } = await supabase
      .from('call_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching call records:', error);
      throw error;
    }
    
    return data as DbCallRecord[];
  } catch (error) {
    console.error('Error in getCallRecords:', error);
    throw error;
  }
}

// Save call notes
export async function saveCallNotes(callId: string, notes: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('call_records')
      .update({ notes: notes })
      .eq('call_id', callId);
    
    if (error) {
      console.error('Error saving call notes:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveCallNotes:', error);
    throw error;
  }
}

// Get SMS records for the current user
export async function getSmsRecords(userId: string): Promise<DbSmsRecord[]> {
  try {
    const { data, error } = await supabase
      .from('sms_records')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching SMS records:', error);
      throw error;
    }
    
    return data as DbSmsRecord[];
  } catch (error) {
    console.error('Error in getSmsRecords:', error);
    throw error;
  }
}

// Send SMS
export async function sendSms(
  userId: string,
  phoneNumber: string,
  message: string,
  contactName?: string,
  providerId?: string,
  leadId?: string
): Promise<SmsRecord> {
  // If a provider ID was provided, use it. Otherwise get the default provider.
  let provider;
  
  if (providerId) {
    const { data, error } = await supabase
      .from('communication_providers')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (error) throw error;
    provider = mapProviderData(data);
  } else {
    provider = await getDefaultCommunicationProvider(userId);
    if (!provider) {
      throw new Error('No communication provider found');
    }
  }
  
  // Call the edge function to send the SMS
  const { data, error } = await supabase
    .functions
    .invoke('send-sms', {
      body: {
        phoneNumber,
        message,
        providerId: provider.id,
        providerType: provider.type,
        providerConfig: provider.config
      }
    });
  
  if (error) throw error;
  
  // Save SMS record to database
  const smsRecord = {
    user_id: userId,
    provider_id: provider.id,
    sms_id: data?.smsId || uuidv4(),
    phone_number: phoneNumber,
    contact_name: contactName || 'Unknown',
    timestamp: new Date().toISOString(),
    message,
    direction: 'outgoing' as const,
    lead_id: leadId
  };
  
  const { error: insertError } = await supabase
    .from('sms_records')
    .insert(smsRecord);
  
  if (insertError) throw insertError;
  
  return {
    id: smsRecord.sms_id,
    phoneNumber,
    contactName: contactName || 'Unknown',
    timestamp: new Date().toISOString(),
    message,
    direction: 'outgoing'
  };
}

// Function to update lead_id in call_records table
export async function updateCallRecordLeadId(callId: string, leadId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('call_records')
      .update({ lead_id: leadId })
      .eq('call_id', callId);

    if (error) {
      console.error('Error updating call record with lead_id:', error);
      toast.error(`Error updating call record: ${error.message}`);
      throw error;
    }
    toast.success('Call record updated successfully!');
  } catch (error: any) {
    console.error('Error in updateCallRecordLeadId:', error);
    toast.error(`Failed to update call record: ${error.message}`);
  }
}

// Function to update lead_id in sms_records table
export async function updateSmsRecordLeadId(smsId: string, leadId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('sms_records')
      .update({ lead_id: leadId })
      .eq('sms_id', smsId);

    if (error) {
      console.error('Error updating sms record with lead_id:', error);
      toast.error(`Error updating SMS record: ${error.message}`);
      throw error;
    }
    toast.success('SMS record updated successfully!');
  } catch (error: any) {
    console.error('Error in updateSmsRecordLeadId:', error);
    toast.error(`Failed to update SMS record: ${error.message}`);
  }
}

/**
 * React hook to interact with communication providers using Supabase
 */
export function useSupabaseCommunication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get all providers
  const getProviders = useCallback(async (): Promise<DbCommunicationProvider[]> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      const providers = await getCommunicationProviders(userId);
      return providers;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get providers'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a provider (create or update)
  const saveProvider = useCallback(async (provider: Omit<DbCommunicationProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbCommunicationProvider> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      
      // Create a new provider
      const newProvider = await createCommunicationProvider(
        userId,
        provider.name,
        provider.type,
        provider.is_default,
        provider.config
      );
      
      return newProvider;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save provider'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a provider
  const deleteProvider = useCallback(async (providerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteCommunicationProvider(providerId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete provider'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Make a call
  const makeSupabaseCall = useCallback(async (
    providerId: string,
    providerType: string,
    phoneNumber: string,
    contactName: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      const result = await makeCall(userId, phoneNumber, contactName, providerId, providerType);
      return result.callId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to make call'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // End a call (placeholder for future implementation)
  const endSupabaseCall = useCallback(async (callId: string, duration: number): Promise<void> => {
    // This would be implemented to update call records with duration, etc.
    console.log(`Call ${callId} ended after ${duration} seconds`);
  }, []);

  // Get call history
  const getCallHistory = useCallback(async (): Promise<DbCallRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      return await getCallRecords(userId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get call history'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send SMS
  const sendSupabaseSms = useCallback(async (
    phoneNumber: string,
    message: string,
    contactName: string = 'Unknown',
    providerId?: string,
    leadId?: string
  ): Promise<SmsRecord> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      return await sendSms(userId, phoneNumber, message, contactName, providerId, leadId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send SMS'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get SMS history
  const getSmsHistory = useCallback(async (): Promise<DbSmsRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      // For development purposes, use "system" as the user ID
      const userId = 'system';
      return await getSmsRecords(userId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get SMS history'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProviders,
    saveProvider,
    deleteProvider,
    makeCall: makeSupabaseCall,
    endCall: endSupabaseCall,
    getCallHistory,
    sendSms: sendSupabaseSms,
    getSmsHistory
  };
}
