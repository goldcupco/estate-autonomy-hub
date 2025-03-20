import { supabase, DbCommunicationProvider, ProviderType, DbCallRecord, DbSmsRecord, mapProviderData } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { CallRecord, SmsRecord } from './communicationUtils';
import { useToast } from "@/hooks/use-toast";
import { verifyDatabaseSetup } from './supabaseSetup';

// Re-export the DbCommunicationProvider type so it can be used elsewhere
export type { DbCommunicationProvider } from './supabaseClient';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return true; // We're now using hardcoded credentials, so this is always true
};

// Service to interact with Supabase for communication functionality
export class SupabaseCommunicationService {
  constructor() {
    // Verify database setup on initialization
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await verifyDatabaseSetup();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async getProviders(userId: string): Promise<DbCommunicationProvider[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Returning mock data.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('communication_providers')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Convert the data to the correct type using our mapper
    return (data || []).map(mapProviderData);
  }

  async saveProvider(userId: string, provider: Omit<DbCommunicationProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot save provider.');
      return 'mock-id';
    }
    
    const newProvider = {
      ...provider,
      id: uuidv4(),
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('communication_providers')
      .insert(newProvider)
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  }

  async updateProvider(id: string, updates: Partial<DbCommunicationProvider>): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot update provider.');
      return;
    }
    
    const { error } = await supabase
      .from('communication_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
  }

  async deleteProvider(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Cannot delete provider.');
      return;
    }
    
    const { error } = await supabase
      .from('communication_providers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }

  async makeCall(userId: string, providerId: string, providerType: ProviderType, phoneNumber: string, contactName: string): Promise<string> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Returning mock data.');
      return 'mock-call-id';
    }
    
    try {
      // This would call a Supabase Edge Function that interfaces with Twilio/CallRail API
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: { userId, providerId, providerType, phoneNumber, contactName }
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
        duration: 0,
        notes: 'Call in progress...'
      };
      
      const { error: insertError } = await supabase
        .from('call_records')
        .insert(callRecord);
        
      if (insertError) throw insertError;
      
      return callRecord.call_id;
    } catch (error) {
      console.error('Error making call:', error);
      // Use mock data in case of error
      const mockCallId = `mock-${uuidv4()}`;
      return mockCallId;
    }
  }

  async endCall(callId: string, duration: number): Promise<CallRecord> {
    // This would call a Supabase Edge Function to end the call
    const { data, error } = await supabase.functions.invoke('end-call', {
      body: { callId, duration }
    });
    
    if (error) throw error;
    
    // Update call record in database
    const { data: callData, error: updateError } = await supabase
      .from('call_records')
      .update({
        duration,
        notes: 'Call completed',
        recording_url: data.recordingUrl
      })
      .eq('call_id', callId)
      .select('*')
      .single();
      
    if (updateError) throw updateError;
    
    return {
      id: callData.call_id,
      phoneNumber: callData.phone_number,
      contactName: callData.contact_name,
      timestamp: callData.timestamp,
      duration: callData.duration,
      recordingUrl: callData.recording_url,
      notes: callData.notes
    };
  }

  async getCallHistory(userId: string, phoneNumber?: string): Promise<CallRecord[]> {
    let query = supabase
      .from('call_records')
      .select('*')
      .eq('user_id', userId);
      
    if (phoneNumber) {
      query = query.eq('phone_number', phoneNumber);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.call_id,
      phoneNumber: record.phone_number,
      contactName: record.contact_name,
      timestamp: record.timestamp,
      duration: record.duration,
      recordingUrl: record.recording_url,
      notes: record.notes
    }));
  }

  async sendSms(userId: string, providerId: string, phoneNumber: string, message: string, contactName?: string): Promise<SmsRecord> {
    // This would call a Supabase Edge Function to send the SMS
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { userId, providerId, phoneNumber, message, contactName }
    });
    
    if (error) throw error;
    
    // Save SMS record to database
    const smsRecord = {
      user_id: userId,
      provider_id: providerId,
      sms_id: data?.smsId || uuidv4(),
      phone_number: phoneNumber,
      contact_name: contactName || 'Unknown',
      timestamp: new Date().toISOString(),
      message,
      direction: 'outgoing' as const
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

  async getSmsHistory(userId: string, phoneNumber?: string): Promise<SmsRecord[]> {
    let query = supabase
      .from('sms_records')
      .select('*')
      .eq('user_id', userId);
      
    if (phoneNumber) {
      query = query.eq('phone_number', phoneNumber);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.sms_id,
      phoneNumber: record.phone_number,
      contactName: record.contact_name,
      timestamp: record.timestamp,
      message: record.message,
      direction: record.direction as 'outgoing' | 'incoming'
    }));
  }
}

// Create a hook for components to use the Supabase communication service
export function useSupabaseCommunication() {
  const service = new SupabaseCommunicationService();
  const { toast } = useToast();
  
  // Get the current user's ID
  const getUserId = async (): Promise<string> => {
    if (!isSupabaseConfigured()) {
      return 'mock-user-id';
    }
    
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // For development, use a mock user ID if not authenticated
        console.warn('User not authenticated, using mock ID');
        return 'mock-user-id';
      }
      return data.user.id;
    } catch (error) {
      console.error('Error getting user:', error);
      return 'mock-user-id';
    }
  };
  
  return {
    getProviders: async () => {
      try {
        const userId = await getUserId();
        return await service.getProviders(userId);
      } catch (error) {
        console.error('Error getting providers:', error);
        toast({
          title: 'Error getting providers',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return [];
        }
        
        throw error;
      }
    },
    
    saveProvider: async (provider: Omit<DbCommunicationProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      try {
        const userId = await getUserId();
        return await service.saveProvider(userId, provider);
      } catch (error) {
        console.error('Error saving provider:', error);
        toast({
          title: 'Error saving provider',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return 'mock-id';
        }
        
        throw error;
      }
    },
    
    updateProvider: async (id: string, updates: Partial<DbCommunicationProvider>) => {
      try {
        await service.updateProvider(id, updates);
      } catch (error) {
        console.error('Error updating provider:', error);
        toast({
          title: 'Error updating provider',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return;
        }
        
        throw error;
      }
    },
    
    deleteProvider: async (id: string) => {
      try {
        await service.deleteProvider(id);
      } catch (error) {
        console.error('Error deleting provider:', error);
        toast({
          title: 'Error deleting provider',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return;
        }
        
        throw error;
      }
    },
    
    makeCall: async (providerId: string, providerType: ProviderType, phoneNumber: string, contactName: string) => {
      try {
        const userId = await getUserId();
        return await service.makeCall(userId, providerId, providerType, phoneNumber, contactName);
      } catch (error) {
        console.error('Error making call:', error);
        toast({
          title: 'Error making call',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return 'mock-call-id';
        }
        
        throw error;
      }
    },
    
    endCall: async (callId: string, duration: number) => {
      try {
        return await service.endCall(callId, duration);
      } catch (error) {
        console.error('Error ending call:', error);
        toast({
          title: 'Error ending call',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return;
        }
        
        throw error;
      }
    },
    
    getCallHistory: async (phoneNumber?: string) => {
      try {
        const userId = await getUserId();
        return await service.getCallHistory(userId, phoneNumber);
      } catch (error) {
        console.error('Error getting call history:', error);
        toast({
          title: 'Error getting call history',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return [];
        }
        
        return [];
      }
    },
    
    sendSms: async (providerId: string, phoneNumber: string, message: string, contactName?: string) => {
      try {
        const userId = await getUserId();
        return await service.sendSms(userId, providerId, phoneNumber, message, contactName);
      } catch (error) {
        console.error('Error sending SMS:', error);
        toast({
          title: 'Error sending SMS',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return {
            id: 'mock-sms-id',
            phoneNumber,
            contactName: contactName || 'Unknown',
            timestamp: new Date().toISOString(),
            message,
            direction: 'outgoing'
          };
        }
        
        throw error;
      }
    },
    
    getSmsHistory: async (phoneNumber?: string) => {
      try {
        const userId = await getUserId();
        return await service.getSmsHistory(userId, phoneNumber);
      } catch (error) {
        console.error('Error getting SMS history:', error);
        toast({
          title: 'Error getting SMS history',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
        
        if (!isSupabaseConfigured()) {
          return [];
        }
        
        return [];
      }
    }
  };
}
