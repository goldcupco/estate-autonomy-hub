
import { supabase, DbCommunicationProvider, ProviderType, DbCallRecord, DbSmsRecord } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { CallRecord, SmsRecord } from './communicationUtils';
import { useToast } from "@/hooks/use-toast";

// Service to interact with Supabase for communication functionality
export class SupabaseCommunicationService {
  async getProviders(userId: string): Promise<DbCommunicationProvider[]> {
    const { data, error } = await supabase
      .from('communication_providers')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
  }

  async saveProvider(userId: string, provider: Omit<DbCommunicationProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
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
    const { error } = await supabase
      .from('communication_providers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }

  async makeCall(userId: string, providerId: string, providerType: ProviderType, phoneNumber: string, contactName: string): Promise<string> {
    // This would call a Supabase Edge Function that interfaces with Twilio/CallRail API
    const { data, error } = await supabase.functions.invoke('make-call', {
      body: { userId, providerId, providerType, phoneNumber, contactName }
    });
    
    if (error) throw error;
    
    // Save call record to database
    const callRecord: Omit<DbCallRecord, 'id' | 'created_at'> = {
      user_id: userId,
      provider_id: providerId,
      provider_type: providerType,
      call_id: data.callId,
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
    
    return data.callId;
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
    const smsRecord: Omit<DbSmsRecord, 'id' | 'created_at'> = {
      user_id: userId,
      provider_id: providerId,
      sms_id: data.smsId,
      phone_number: phoneNumber,
      contact_name: contactName || 'Unknown',
      timestamp: new Date().toISOString(),
      message,
      direction: 'outgoing'
    };
    
    const { error: insertError } = await supabase
      .from('sms_records')
      .insert(smsRecord);
      
    if (insertError) throw insertError;
    
    return {
      id: data.smsId,
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
      direction: record.direction
    }));
  }
}

// Create a hook for components to use the Supabase communication service
export function useSupabaseCommunication() {
  const service = new SupabaseCommunicationService();
  const { toast } = useToast();
  
  // Get the current user's ID
  const getUserId = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('User not authenticated');
    return data.user.id;
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
        return [];
      }
    }
  };
}
