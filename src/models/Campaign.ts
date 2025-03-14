
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'seller' | 'buyer' | 'both';
  leads: string[]; // IDs of leads in this campaign
  startDate: string;
  endDate?: string;
  createdBy: string; // ID of the user who created it
  assignedUsers: string[]; // IDs of users assigned to this campaign
  budget?: number;
  metrics?: {
    contacts: number;
    responses: number;
    conversions: number;
  };
  accessRestricted?: boolean; // If true, only assigned users can access
}

// Mock data for campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Spring Sellers Campaign',
    description: 'Target campaign for spring property listings',
    status: 'active',
    type: 'seller',
    leads: ['1', '3', '5'],
    startDate: '2023-04-01',
    createdBy: '1',
    assignedUsers: ['2'],
    budget: 5000,
    metrics: {
      contacts: 342,
      responses: 87,
      conversions: 14
    },
    accessRestricted: true
  },
  {
    id: '2',
    name: 'First-Time Buyers',
    description: 'Campaign targeting first-time home buyers',
    status: 'active',
    type: 'buyer',
    leads: ['2', '4', '6'],
    startDate: '2023-05-15',
    createdBy: '1',
    assignedUsers: ['2'],
    budget: 7500,
    metrics: {
      contacts: 178,
      responses: 63,
      conversions: 9
    },
    accessRestricted: false
  },
  {
    id: '3',
    name: 'Expired Listings Follow-up',
    description: 'Follow-up campaign for expired listings',
    status: 'paused',
    type: 'seller',
    leads: ['7', '8'],
    startDate: '2023-03-01',
    createdBy: '1',
    assignedUsers: ['3'],
    budget: 3000,
    metrics: {
      contacts: 98,
      responses: 29,
      conversions: 4
    },
    accessRestricted: true
  },
  {
    id: '4',
    name: 'Investment Properties',
    description: 'Campaign for investment property buyers',
    status: 'active',
    type: 'both',
    leads: ['9', '10', '11'],
    startDate: '2023-06-01',
    createdBy: '1',
    assignedUsers: ['3'],
    budget: 10000,
    metrics: {
      contacts: 124,
      responses: 41,
      conversions: 7
    },
    accessRestricted: false
  },
];
