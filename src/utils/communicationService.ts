/**
 * Communication Service
 * Manages communication providers and provides a unified interface for calls and SMS
 */

import { useToast } from "@/hooks/use-toast";
import { 
  CallRecord, 
  SmsRecord,
  startCallRecording as mockStartCallRecording,
  endCallRecording as mockEndCallRecording,
  logSmsMessage as mockLogSmsMessage,
  getSmsHistory as mockGetSmsHistory
} from './communicationUtils';
import { 
  CallProvider, 
  SmsProvider, 
  TwilioProvider, 
  CallRailProvider 
} from './communicationProviders';

// Communication service configuration with proper literal types
interface CommunicationServiceConfig {
  defaultCallProvider?: 'twilio' | 'callrail';
  defaultSmsProvider?: 'twilio';
  providerConfig: {
    twilio?: {
      accountSid?: string;
      authToken?: string;
      twilioNumber?: string;
    };
    callrail?: {
      apiKey?: string;
      accountId?: string;
    };
  };
  useMock?: boolean;
}

class CommunicationService {
  private callProviders: { [key: string]: CallProvider } = {};
  private smsProviders: { [key: string]: SmsProvider } = {};
  private defaultCallProvider?: string;
  private defaultSmsProvider?: string;
  private useMock: boolean;

  constructor(config: CommunicationServiceConfig) {
    this.useMock = config.useMock || false;

    // Initialize Twilio if configured
    if (config.providerConfig.twilio) {
      const twilioProvider = new TwilioProvider(config.providerConfig.twilio);
      this.callProviders.twilio = twilioProvider;
      this.smsProviders.twilio = twilioProvider;
    }

    // Initialize CallRail if configured
    if (config.providerConfig.callrail) {
      const callrailProvider = new CallRailProvider(config.providerConfig.callrail);
      this.callProviders.callrail = callrailProvider;
    }

    // Set default providers
    this.defaultCallProvider = config.defaultCallProvider;
    this.defaultSmsProvider = config.defaultSmsProvider;
  }

  // Get available providers
  getAvailableCallProviders(): CallProvider[] {
    return Object.values(this.callProviders);
  }

  getAvailableSmsProviders(): SmsProvider[] {
    return Object.values(this.smsProviders);
  }

  // Check if any providers are configured
  hasConfiguredCallProvider(): boolean {
    return this.getAvailableCallProviders().some(provider => provider.isConfigured);
  }

  hasConfiguredSmsProvider(): boolean {
    return this.getAvailableSmsProviders().some(provider => provider.isConfigured);
  }

  // Get default provider
  getDefaultCallProvider(): CallProvider | undefined {
    if (this.defaultCallProvider && this.callProviders[this.defaultCallProvider]) {
      return this.callProviders[this.defaultCallProvider];
    }
    
    // Fall back to first configured provider
    const configured = this.getAvailableCallProviders().find(provider => provider.isConfigured);
    return configured;
  }

  getDefaultSmsProvider(): SmsProvider | undefined {
    if (this.defaultSmsProvider && this.smsProviders[this.defaultSmsProvider]) {
      return this.smsProviders[this.defaultSmsProvider];
    }
    
    // Fall back to first configured provider
    const configured = this.getAvailableSmsProviders().find(provider => provider.isConfigured);
    return configured;
  }

  // Call functions
  async makeCall(phoneNumber: string, contactName: string, providerType?: 'twilio' | 'callrail'): Promise<string> {
    if (this.useMock) {
      return mockStartCallRecording(phoneNumber, contactName);
    }

    let provider: CallProvider | undefined;
    
    if (providerType && this.callProviders[providerType]) {
      provider = this.callProviders[providerType];
    } else {
      provider = this.getDefaultCallProvider();
    }

    if (!provider || !provider.isConfigured) {
      throw new Error('No configured call provider available');
    }

    return provider.makeCall(phoneNumber, contactName);
  }

  async endCall(callId: string, duration: number, providerType?: 'twilio' | 'callrail'): Promise<CallRecord> {
    if (this.useMock) {
      return mockEndCallRecording(callId, duration);
    }

    // Determine provider from call ID prefix if not specified
    if (!providerType) {
      if (callId.startsWith('twl-')) {
        providerType = 'twilio';
      } else if (callId.startsWith('cr-')) {
        providerType = 'callrail';
      }
    }

    let provider: CallProvider | undefined;
    
    if (providerType && this.callProviders[providerType]) {
      provider = this.callProviders[providerType];
    } else {
      provider = this.getDefaultCallProvider();
    }

    if (!provider || !provider.isConfigured) {
      throw new Error('No configured call provider available');
    }

    return provider.endCall(callId, duration);
  }

  async getCallHistory(phoneNumber?: string, providerType?: 'twilio' | 'callrail'): Promise<CallRecord[]> {
    if (this.useMock) {
      // Mock implementation doesn't have filtering by phone number built in
      return [];
    }

    let provider: CallProvider | undefined;
    
    if (providerType && this.callProviders[providerType]) {
      provider = this.callProviders[providerType];
    } else {
      provider = this.getDefaultCallProvider();
    }

    if (!provider || !provider.isConfigured) {
      throw new Error('No configured call provider available');
    }

    return provider.getCallHistory(phoneNumber);
  }

  // SMS functions
  async sendSms(phoneNumber: string, message: string, contactName?: string): Promise<SmsRecord> {
    if (this.useMock) {
      return mockLogSmsMessage(phoneNumber, message, 'outgoing', contactName);
    }

    const provider = this.getDefaultSmsProvider();

    if (!provider || !provider.isConfigured) {
      throw new Error('No configured SMS provider available');
    }

    return provider.sendSms(phoneNumber, message, contactName);
  }

  async getSmsHistory(phoneNumber?: string): Promise<SmsRecord[]> {
    if (this.useMock) {
      return mockGetSmsHistory(phoneNumber);
    }

    const provider = this.getDefaultSmsProvider();

    if (!provider || !provider.isConfigured) {
      throw new Error('No configured SMS provider available');
    }

    return provider.getSmsHistory(phoneNumber);
  }
}

// Create a singleton instance with mock mode enabled by default
// In a real app, you would load config from environment or user settings
let communicationService: CommunicationService;

export function initCommunicationService(config: CommunicationServiceConfig): CommunicationService {
  communicationService = new CommunicationService(config);
  return communicationService;
}

export function getCommunicationService(): CommunicationService {
  if (!communicationService) {
    // Initialize with mock mode enabled if not initialized yet
    initCommunicationService({
      useMock: true,
      providerConfig: {}
    });
  }
  
  return communicationService;
}

// Helper hook for components to use the communication service
export function useCommunication() {
  const service = getCommunicationService();
  const { toast } = useToast();
  
  const makeCall = async (phoneNumber: string, contactName: string, provider?: 'twilio' | 'callrail') => {
    try {
      return await service.makeCall(phoneNumber, contactName, provider);
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        title: 'Error making call',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const endCall = async (callId: string, duration: number, provider?: 'twilio' | 'callrail') => {
    try {
      return await service.endCall(callId, duration, provider);
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: 'Error ending call',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const sendSms = async (phoneNumber: string, message: string, contactName?: string) => {
    try {
      return await service.sendSms(phoneNumber, message, contactName);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'Error sending SMS',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  return {
    makeCall,
    endCall,
    sendSms,
    getCallHistory: service.getCallHistory.bind(service),
    getSmsHistory: service.getSmsHistory.bind(service),
    hasConfiguredCallProvider: service.hasConfiguredCallProvider.bind(service),
    hasConfiguredSmsProvider: service.hasConfiguredSmsProvider.bind(service),
    getAvailableCallProviders: service.getAvailableCallProviders.bind(service),
    getAvailableSmsProviders: service.getAvailableSmsProviders.bind(service)
  };
}
