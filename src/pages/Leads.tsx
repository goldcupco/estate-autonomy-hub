
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LeadTable, { Lead } from '@/components/leads/LeadTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';

// Dummy lead data (expanded)
const leadsData: Lead[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    status: 'New',
    source: 'Website Inquiry',
    dateAdded: '2023-06-15',
    lastContact: '2023-06-15',
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
  }
];

// Filter leads by status for the tabs
const filterLeadsByStatus = (status: string) => {
  if (status === 'All') return leadsData;
  return leadsData.filter(lead => lead.status === status);
};

export function Leads() {
  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <Button className="flex items-center gap-2 animate-scale-in">
          <UserPlus className="h-4 w-4" />
          <span>Add Lead</span>
        </Button>
      </div>
      
      <Tabs defaultValue="All" className="w-full animate-scale-in">
        <TabsList className="mb-6">
          <TabsTrigger value="All">All Leads</TabsTrigger>
          <TabsTrigger value="New">New</TabsTrigger>
          <TabsTrigger value="Contacted">Contacted</TabsTrigger>
          <TabsTrigger value="Qualified">Qualified</TabsTrigger>
          <TabsTrigger value="Negotiating">Negotiating</TabsTrigger>
          <TabsTrigger value="Closed">Closed</TabsTrigger>
          <TabsTrigger value="Lost">Lost</TabsTrigger>
        </TabsList>
        
        <TabsContent value="All" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('All')} />
        </TabsContent>
        
        <TabsContent value="New" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('New')} />
        </TabsContent>
        
        <TabsContent value="Contacted" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('Contacted')} />
        </TabsContent>
        
        <TabsContent value="Qualified" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('Qualified')} />
        </TabsContent>
        
        <TabsContent value="Negotiating" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('Negotiating')} />
        </TabsContent>
        
        <TabsContent value="Closed" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('Closed')} />
        </TabsContent>
        
        <TabsContent value="Lost" className="space-y-6 mt-6">
          <LeadTable data={filterLeadsByStatus('Lost')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Leads;
