
import { useSupabaseCommunication } from './supabaseCommunicationService';
import { useToast } from "@/hooks/use-toast";

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
    makeCall, 
    endCall, 
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
