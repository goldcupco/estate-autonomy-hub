
export interface Note {
  id: string;
  text: string;
  type: 'sms' | 'call' | 'letter' | 'contract' | 'other' | 'stage_change';
  timestamp: string;
  metadata?: {
    recordingUrl?: string;
    letterUrl?: string; 
    contractUrl?: string;
    previousStage?: string;
    newStage?: string;
    callDuration?: number;
    smsContent?: string;
    letterContent?: string;
    contractContent?: string;
    trackingNumber?: string;
    recipient?: string;
    sender?: string;
    callStartTime?: string;
    callEndTime?: string;
  };
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Negotiating' | 'Closed' | 'Lost';
  source: string;
  dateAdded: string;
  lastContact: string;
  notes?: Note[];
  flaggedForNextStage?: boolean;
  readyToMove?: boolean;
  doNotContact?: boolean;
}
