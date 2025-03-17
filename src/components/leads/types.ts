
export interface Note {
  id: string;
  text: string;
  type: 'sms' | 'call' | 'letter' | 'contract' | 'other';
  timestamp: string;
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
}
