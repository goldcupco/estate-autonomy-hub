
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

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
  direction: 'outgoing' | 'incoming';
}

export interface LetterRecord {
  id: string;
  recipient: string;
  address?: string;
  timestamp: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered';
  trackingNumber?: string;
}

// In-memory storage for demo purposes
// In a real app, this would be stored in a database
let callRecords: CallRecord[] = [];
let smsRecords: SmsRecord[] = [];
let letterRecords: LetterRecord[] = [];

export const startCallRecording = (phoneNumber: string, contactName: string = 'Unknown'): string => {
  console.log(`Started recording call with ${contactName} at ${phoneNumber}`);
  
  // In a real app, this would initialize actual call recording
  // For demo purposes, we just create a record
  const callId = uuidv4();
  const timestamp = new Date().toISOString();
  
  callRecords.push({
    id: callId,
    phoneNumber,
    contactName,
    timestamp,
    duration: 0, // Will be updated when call ends
    notes: 'Call in progress...'
  });
  
  return callId;
};

export const endCallRecording = (callId: string, duration: number): CallRecord => {
  // Find and update the call record
  const callIndex = callRecords.findIndex(call => call.id === callId);
  
  if (callIndex >= 0) {
    callRecords[callIndex] = {
      ...callRecords[callIndex],
      duration,
      notes: 'Call completed',
      recordingUrl: `https://example.com/recordings/${callId}.mp3` // Simulated URL
    };
    
    console.log(`Ended recording for call ${callId}. Duration: ${duration} seconds`);
    return callRecords[callIndex];
  }
  
  throw new Error('Call record not found');
};

export const getCallRecordings = (): CallRecord[] => {
  return [...callRecords];
};

export const logSmsMessage = (
  phoneNumber: string, 
  message: string, 
  direction: 'outgoing' | 'incoming',
  contactName: string = 'Unknown'
): SmsRecord => {
  const smsId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const smsRecord: SmsRecord = {
    id: smsId,
    phoneNumber,
    contactName,
    timestamp,
    message,
    direction
  };
  
  smsRecords.push(smsRecord);
  console.log(`Logged ${direction} SMS to ${contactName}: ${message}`);
  
  return smsRecord;
};

export const getSmsHistory = (phoneNumber?: string): SmsRecord[] => {
  if (phoneNumber) {
    return smsRecords.filter(record => record.phoneNumber === phoneNumber);
  }
  return [...smsRecords];
};

export const trackLetterSending = (
  recipient: string,
  content: string,
  address?: string
): LetterRecord => {
  const letterId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const letterRecord: LetterRecord = {
    id: letterId,
    recipient,
    address,
    timestamp,
    content,
    status: 'sent',
    trackingNumber: `LTR-${Math.floor(100000 + Math.random() * 900000)}` // Simulated tracking number
  };
  
  letterRecords.push(letterRecord);
  console.log(`Tracked letter to ${recipient}. Tracking #: ${letterRecord.trackingNumber}`);
  
  return letterRecord;
};

export const getLetterRecords = (): LetterRecord[] => {
  return [...letterRecords];
};

export const updateLetterStatus = (id: string, status: 'draft' | 'sent' | 'delivered'): LetterRecord => {
  const letterIndex = letterRecords.findIndex(letter => letter.id === id);
  
  if (letterIndex >= 0) {
    letterRecords[letterIndex] = {
      ...letterRecords[letterIndex],
      status
    };
    
    return letterRecords[letterIndex];
  }
  
  throw new Error('Letter record not found');
};
