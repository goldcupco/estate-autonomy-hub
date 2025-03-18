
// Types for communication records and services
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
