
import { useSupabaseCommunication } from './supabaseCommunicationService';
import { useToast } from "@/hooks/use-toast";
import { ProviderType } from './supabaseClient';

// Configuration interface to match what's used in the CommunicationSettings component
export interface CommunicationServiceConfig {
  defaultCallProvider?: 'twilio' | 'callrail';
  defaultSmsProvider?: 'twilio';
  providerConfig: {
    twilio?: {
      accountSid: string;
      authToken: string;
      twilioNumber: string;
    };
    callrail?: {
      apiKey: string;
      accountId: string;
    };
  };
  useMock: boolean;
}

// Global reference to the current configuration
let currentConfig: CommunicationServiceConfig | null = null;

// Initialize the communication service with config
export function initCommunicationService(config: CommunicationServiceConfig): void {
  currentConfig = config;
  console.log('Communication service initialized with config:', config);
  
  // Store in localStorage for persistence
  localStorage.setItem('communicationServiceConfig', JSON.stringify(config));
}

// Get the current communication service configuration
export function getCommunicationService(): CommunicationServiceConfig | null {
  // If not initialized yet, try to load from localStorage
  if (currentConfig === null) {
    const savedConfig = localStorage.getItem('communicationServiceConfig');
    if (savedConfig) {
      try {
        currentConfig = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Error parsing saved communication config:', e);
      }
    }
  }
  
  return currentConfig;
}

export function useCommunication() {
  const { 
    getProviders, 
    makeCall: makeSupabaseCall, 
    endCall: endSupabaseCall, 
    getCallHistory, 
    sendSms, 
    getSmsHistory 
  } = useSupabaseCommunication();
  const { toast } = useToast();

  // Check if user has configured providers
  const hasConfiguredCallProvider = async (): Promise<boolean> => {
    try {
      const providers = await getProviders();
      return providers.length > 0;
    } catch (error) {
      console.error('Error checking for providers:', error);
      return false;
    }
  };

  // Wrapped makeCall function to handle provider selection and adapt parameters
  const makeCall = async (
    phoneNumber: string, 
    contactName: string, 
    notes: string = '',
    providerId?: string
  ): Promise<string> => {
    try {
      // If no providerId is specified, get the first available provider
      if (!providerId) {
        const providers = await getProviders();
        if (providers.length === 0) {
          throw new Error('No call providers configured');
        }
        
        providerId = providers[0].id;
        const providerType = providers[0].type as ProviderType;
        
        // Now make the call with the selected provider
        return await makeSupabaseCall(providerId, providerType, phoneNumber, contactName);
      } else {
        // Get the provider type for the specified providerId
        const providers = await getProviders();
        const provider = providers.find(p => p.id === providerId);
        
        if (!provider) {
          throw new Error('Selected provider not found');
        }
        
        return await makeSupabaseCall(providerId, provider.type as ProviderType, phoneNumber, contactName);
      }
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  };

  // Wrapped endCall function
  const endCall = async (callId: string, duration: number) => {
    try {
      return await endSupabaseCall(callId, duration);
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  };

  return {
    // Re-export the base functions
    getProviders,
    makeCall,
    endCall,
    getCallHistory,
    sendSms,
    getSmsHistory,
    
    // Helper functions
    hasConfiguredCallProvider
  };
}
