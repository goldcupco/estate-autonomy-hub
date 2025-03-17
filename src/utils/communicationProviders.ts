
/**
 * Communication Providers for Twilio and CallRail
 * This file manages integrations with communication service providers
 */

import { CallRecord, SmsRecord, LetterRecord } from '@/utils/communicationUtils';

// Provider interfaces
export interface CommunicationProvider {
  name: string;
  type: 'twilio' | 'callrail';
  isConfigured: boolean;
}

export interface CallProvider extends CommunicationProvider {
  makeCall: (phoneNumber: string, contactName: string) => Promise<string>;
  recordCall: (callId: string, recordingEnabled: boolean) => Promise<boolean>;
  endCall: (callId: string, duration: number) => Promise<CallRecord>;
  getCallHistory: (phoneNumber?: string) => Promise<CallRecord[]>;
}

export interface SmsProvider extends CommunicationProvider {
  sendSms: (phoneNumber: string, message: string, contactName?: string) => Promise<SmsRecord>;
  getSmsHistory: (phoneNumber?: string) => Promise<SmsRecord[]>;
}

// Implementation for Twilio provider
export class TwilioProvider implements CallProvider, SmsProvider {
  name = 'Twilio';
  type = 'twilio';
  accountSid?: string;
  authToken?: string;
  twilioNumber?: string;
  
  constructor(config?: { accountSid?: string; authToken?: string; twilioNumber?: string }) {
    this.accountSid = config?.accountSid;
    this.authToken = config?.authToken;
    this.twilioNumber = config?.twilioNumber;
  }

  get isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.twilioNumber);
  }

  // Call methods
  async makeCall(phoneNumber: string, contactName: string): Promise<string> {
    this.checkConfiguration();
    console.log(`[Twilio] Making call to ${contactName} at ${phoneNumber}`);

    // In a production app, this would make an actual API call to Twilio
    // For demo purposes, we'll just return a mock call ID
    return `twl-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async recordCall(callId: string, recordingEnabled: boolean): Promise<boolean> {
    this.checkConfiguration();
    console.log(`[Twilio] ${recordingEnabled ? 'Starting' : 'Stopping'} recording for call ${callId}`);

    // In a production app, this would call the Twilio API to start/stop recording
    return true;
  }

  async endCall(callId: string, duration: number): Promise<CallRecord> {
    this.checkConfiguration();
    console.log(`[Twilio] Ending call ${callId}, duration: ${duration} seconds`);

    // In a production app, this would update the call on Twilio
    // For demo purposes, we'll just return a mock call record
    return {
      id: callId,
      phoneNumber: '(555) 123-4567', // Would come from the actual call data
      contactName: 'Mock Contact', // Would come from the actual call data
      timestamp: new Date().toISOString(),
      duration,
      recordingUrl: `https://api.twilio.com/recordings/${callId}.mp3`,
      notes: 'Call completed via Twilio'
    };
  }

  async getCallHistory(phoneNumber?: string): Promise<CallRecord[]> {
    this.checkConfiguration();
    console.log(`[Twilio] Getting call history${phoneNumber ? ` for ${phoneNumber}` : ''}`);

    // In a production app, this would fetch from the Twilio API
    // For demo purposes, we'll just return mock data
    return [
      {
        id: `twl-${Date.now() - 10000}`,
        phoneNumber: phoneNumber || '(555) 123-4567',
        contactName: 'Twilio Test Contact',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        duration: 120,
        recordingUrl: `https://api.twilio.com/recordings/mock-id.mp3`,
        notes: 'Twilio test call'
      }
    ];
  }

  // SMS methods
  async sendSms(phoneNumber: string, message: string, contactName?: string): Promise<SmsRecord> {
    this.checkConfiguration();
    console.log(`[Twilio] Sending SMS to ${contactName || phoneNumber}: ${message}`);

    // In a production app, this would make an actual API call to Twilio
    // For demo purposes, we'll just return a mock SMS record
    const smsRecord: SmsRecord = {
      id: `twl-sms-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      phoneNumber,
      contactName: contactName || 'Unknown',
      timestamp: new Date().toISOString(),
      message,
      direction: 'outgoing'
    };

    return smsRecord;
  }

  async getSmsHistory(phoneNumber?: string): Promise<SmsRecord[]> {
    this.checkConfiguration();
    console.log(`[Twilio] Getting SMS history${phoneNumber ? ` for ${phoneNumber}` : ''}`);

    // In a production app, this would fetch from the Twilio API
    // For demo purposes, we'll just return mock data
    return [
      {
        id: `twl-sms-${Date.now() - 10000}`,
        phoneNumber: phoneNumber || '(555) 123-4567',
        contactName: 'Twilio Test Contact',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        message: 'This is a test message from Twilio',
        direction: 'outgoing'
      },
      {
        id: `twl-sms-${Date.now() - 20000}`,
        phoneNumber: phoneNumber || '(555) 123-4567',
        contactName: 'Twilio Test Contact',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        message: 'This is a reply from the contact',
        direction: 'incoming'
      }
    ];
  }

  private checkConfiguration(): void {
    if (!this.isConfigured) {
      throw new Error('Twilio is not properly configured. Please set accountSid, authToken, and twilioNumber.');
    }
  }
}

// Implementation for CallRail provider
export class CallRailProvider implements CallProvider {
  name = 'CallRail';
  type = 'callrail';
  apiKey?: string;
  accountId?: string;
  
  constructor(config?: { apiKey?: string; accountId?: string }) {
    this.apiKey = config?.apiKey;
    this.accountId = config?.accountId;
  }

  get isConfigured(): boolean {
    return !!(this.apiKey && this.accountId);
  }

  // Call methods
  async makeCall(phoneNumber: string, contactName: string): Promise<string> {
    this.checkConfiguration();
    console.log(`[CallRail] Making call to ${contactName} at ${phoneNumber}`);

    // In a production app, this would make an actual API call to CallRail
    // For demo purposes, we'll just return a mock call ID
    return `cr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  async recordCall(callId: string, recordingEnabled: boolean): Promise<boolean> {
    this.checkConfiguration();
    console.log(`[CallRail] ${recordingEnabled ? 'Starting' : 'Stopping'} recording for call ${callId}`);

    // In a production app, this would call the CallRail API
    return true;
  }

  async endCall(callId: string, duration: number): Promise<CallRecord> {
    this.checkConfiguration();
    console.log(`[CallRail] Ending call ${callId}, duration: ${duration} seconds`);

    // In a production app, this would update the call on CallRail
    // For demo purposes, we'll just return a mock call record
    return {
      id: callId,
      phoneNumber: '(555) 987-6543', // Would come from the actual call data
      contactName: 'Mock CallRail Contact', // Would come from the actual call data
      timestamp: new Date().toISOString(),
      duration,
      recordingUrl: `https://app.callrail.com/recordings/${callId}.mp3`,
      notes: 'Call completed via CallRail'
    };
  }

  async getCallHistory(phoneNumber?: string): Promise<CallRecord[]> {
    this.checkConfiguration();
    console.log(`[CallRail] Getting call history${phoneNumber ? ` for ${phoneNumber}` : ''}`);

    // In a production app, this would fetch from the CallRail API
    // For demo purposes, we'll just return mock data
    return [
      {
        id: `cr-${Date.now() - 10000}`,
        phoneNumber: phoneNumber || '(555) 987-6543',
        contactName: 'CallRail Test Contact',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        duration: 180,
        recordingUrl: `https://app.callrail.com/recordings/mock-id.mp3`,
        notes: 'CallRail test call'
      }
    ];
  }

  private checkConfiguration(): void {
    if (!this.isConfigured) {
      throw new Error('CallRail is not properly configured. Please set apiKey and accountId.');
    }
  }
}

// Helper to create provider instances
export function createProvider(type: 'twilio' | 'callrail', config: any): CallProvider | SmsProvider {
  switch (type) {
    case 'twilio':
      return new TwilioProvider(config);
    case 'callrail':
      return new CallRailProvider(config);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
