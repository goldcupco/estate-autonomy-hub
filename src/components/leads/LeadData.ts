import { Lead } from './types';

export const initialLeadsData: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'New',
    source: 'Website Inquiry',
    dateAdded: '2023-06-15',
    lastContact: '2023-06-15',
    notes: [
      {
        id: '101',
        text: 'Initial contact via website form',
        type: 'other',
        timestamp: '2023-06-15T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    status: 'Contacted',
    source: 'Zillow',
    dateAdded: '2023-06-12',
    lastContact: '2023-06-14',
    notes: []
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    status: 'Qualified',
    source: 'Referral',
    dateAdded: '2023-06-10',
    lastContact: '2023-06-13',
    notes: []
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '(555) 321-6547',
    status: 'Negotiating',
    source: 'Direct Mail',
    dateAdded: '2023-06-08',
    lastContact: '2023-06-12',
    notes: []
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    phone: '(555) 789-4561',
    status: 'Lost',
    source: 'Cold Call',
    dateAdded: '2023-06-05',
    lastContact: '2023-06-10',
    notes: []
  },
  {
    id: '6',
    name: 'Jennifer Lee',
    email: 'jennifer.l@example.com',
    phone: '(555) 234-5678',
    status: 'New',
    source: 'Facebook Ad',
    dateAdded: '2023-06-15',
    lastContact: '2023-06-15',
    notes: []
  },
  {
    id: '7',
    name: 'David Garcia',
    email: 'david.g@example.com',
    phone: '(555) 876-5432',
    status: 'Contacted',
    source: 'Google Ad',
    dateAdded: '2023-06-14',
    lastContact: '2023-06-14',
    notes: []
  },
  {
    id: '8',
    name: 'Lisa Rodriguez',
    email: 'lisa.r@example.com',
    phone: '(555) 345-6789',
    status: 'Qualified',
    source: 'Open House',
    dateAdded: '2023-06-12',
    lastContact: '2023-06-13',
    notes: []
  },
  {
    id: '9',
    name: 'Kevin Martinez',
    email: 'kevin.m@example.com',
    phone: '(555) 456-7890',
    status: 'Negotiating',
    source: 'Referral',
    dateAdded: '2023-06-10',
    lastContact: '2023-06-12',
    notes: []
  },
  {
    id: '10',
    name: 'Amanda Clark',
    email: 'amanda.c@example.com',
    phone: '(555) 567-8901',
    status: 'Closed',
    source: 'Website Inquiry',
    dateAdded: '2023-06-08',
    lastContact: '2023-06-11',
    notes: []
  },
  {
    id: '11',
    name: 'Thomas Wright',
    email: 'thomas.w@example.com',
    phone: '(555) 678-9012',
    status: 'Lost',
    source: 'Zillow',
    dateAdded: '2023-06-05',
    lastContact: '2023-06-09',
    notes: []
  },
  {
    id: '12',
    name: 'Michelle Turner',
    email: 'michelle.t@example.com',
    phone: '(555) 789-0123',
    status: 'New',
    source: 'Cold Call',
    dateAdded: '2023-06-15',
    lastContact: '2023-06-15',
    notes: []
  },
  {
    id: '13',
    name: 'Christopher Hill',
    email: 'chris.h@example.com',
    phone: '(555) 890-1234',
    status: 'Contacted',
    source: 'Direct Mail',
    dateAdded: '2023-06-13',
    lastContact: '2023-06-14',
    notes: []
  },
  {
    id: '14',
    name: 'Rebecca Scott',
    email: 'rebecca.s@example.com',
    phone: '(555) 901-2345',
    status: 'Qualified',
    source: 'Facebook Ad',
    dateAdded: '2023-06-11',
    lastContact: '2023-06-13',
    notes: []
  },
  {
    id: '15',
    name: 'Daniel Adams',
    email: 'daniel.a@example.com',
    phone: '(555) 012-3456',
    status: 'Negotiating',
    source: 'Google Ad',
    dateAdded: '2023-06-09',
    lastContact: '2023-06-12',
    notes: []
  }
];

export const getNextStage = (currentStatus: Lead['status']): Lead['status'] | null => {
  const statusFlow: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 2) {
    return null;
  }
  
  return statusFlow[currentIndex + 1];
};
