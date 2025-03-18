
import { v4 as uuidv4 } from 'uuid';

// Types matching what's defined in supabaseClient.ts
export interface CallRecord {
  id: string;
  phoneNumber: string;
  contactName: string;
  timestamp: string;
  duration: number;
  recordingUrl?: string;
  notes?: string;
}

export interface SmsRecord {
  id: string;
  phoneNumber: string;
  contactName: string;
  timestamp: string;
  message: string;
  direction: 'incoming' | 'outgoing';
}

export interface LetterRecord {
  id: string;
  recipient: string;
  content: string;
  timestamp: string;
  trackingNumber?: string;
  status: 'draft' | 'sent' | 'delivered';
  address?: string;
}

// These functions will be used when the user hasn't set up Supabase providers yet
// They provide a fallback for demo/testing purposes

// Store records in memory (would normally be stored in Supabase)
const callRecords: CallRecord[] = [];
const smsRecords: SmsRecord[] = [];
const letterRecords: LetterRecord[] = [];

export function startCallRecording(phoneNumber: string, contactName: string): string {
  const id = uuidv4();
  console.log(`Starting call recording to ${phoneNumber} (${contactName})`);
  return id;
}

export function endCallRecording(callId: string, duration: number): CallRecord {
  console.log(`Ending call recording ${callId}, duration: ${duration}s`);
  
  const callRecord: CallRecord = {
    id: callId,
    phoneNumber: '555-123-4567', // Mock data
    contactName: 'Mock Contact',
    timestamp: new Date().toISOString(),
    duration,
    recordingUrl: `https://example.com/recordings/${callId}.mp3`
  };
  
  callRecords.push(callRecord);
  return callRecord;
}

export function logSmsMessage(
  phoneNumber: string, 
  message: string, 
  direction: 'incoming' | 'outgoing',
  contactName: string = 'Unknown'
): SmsRecord {
  console.log(`Logging ${direction} SMS to/from ${phoneNumber}: ${message}`);
  
  const smsRecord: SmsRecord = {
    id: uuidv4(),
    phoneNumber,
    contactName,
    timestamp: new Date().toISOString(),
    message,
    direction
  };
  
  smsRecords.push(smsRecord);
  return smsRecord;
}

export function getSmsHistory(phoneNumber?: string): SmsRecord[] {
  if (phoneNumber) {
    return smsRecords.filter(record => record.phoneNumber === phoneNumber);
  }
  return [...smsRecords];
}

export function trackLetterSending(
  recipient: string,
  content: string,
  address?: string
): LetterRecord {
  console.log(`Tracking letter to ${recipient}${address ? ` at ${address}` : ''}`);
  
  const letterRecord: LetterRecord = {
    id: uuidv4(),
    recipient,
    content,
    timestamp: new Date().toISOString(),
    trackingNumber: `LTR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    status: 'sent',
    address
  };
  
  letterRecords.push(letterRecord);
  return letterRecord;
}

export function getLetterHistory(recipient?: string): LetterRecord[] {
  if (recipient) {
    return letterRecords.filter(record => record.recipient === recipient);
  }
  return [...letterRecords];
}
