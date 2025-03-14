import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LeadTable, { Lead, Note } from '@/components/leads/LeadTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

const initialLeadsData: Lead[] = [
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

const leadsWithNotes = initialLeadsData.map(lead => ({
  ...lead,
  notes: lead.notes || []
}));

const filterLeadsByStatus = (leads: Lead[], status: string) => {
  if (status === 'All') return leads;
  return leads.filter(lead => lead.status === status);
};

export function Leads() {
  const [leadsData, setLeadsData] = useState<Lead[]>(leadsWithNotes);
  const { toast } = useToast();

  const handleEditLead = (updatedLead: Lead) => {
    setLeadsData(prevLeads => 
      prevLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
  };

  const handleDeleteLead = (id: string) => {
    setLeadsData(prevLeads => prevLeads.filter(lead => lead.id !== id));
  };

  const handleAddNote = (leadId: string, note: Omit<Note, 'id'>) => {
    const newNote: Note = {
      ...note,
      id: uuidv4()
    };

    setLeadsData(prevLeads =>
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          const updatedLead = {
            ...lead,
            lastContact: new Date().toISOString().split('T')[0],
            notes: [...(lead.notes || []), newNote]
          };
          return updatedLead;
        }
        return lead;
      })
    );

    toast({
      title: "Note added",
      description: "Your note has been added to the lead."
    });
  };

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
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'All')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="New" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'New')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="Contacted" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Contacted')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="Qualified" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Qualified')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="Negotiating" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Negotiating')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="Closed" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Closed')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
        
        <TabsContent value="Lost" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Lost')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Leads;
