import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LeadTable, { Lead, Note } from '@/components/leads/LeadTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Phone, MessageSquare, FileText, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddLeadModal } from '@/components/leads/AddLeadModal';

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
  notes: lead.notes || [],
  flaggedForNextStage: false,
  readyToMove: false
}));

const filterLeadsByStatus = (leads: Lead[], status: string) => {
  if (status === 'All') return leads;
  return leads.filter(lead => lead.status === status);
};

const getNextStage = (currentStatus: Lead['status']): Lead['status'] | null => {
  const statusFlow: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 2) {
    return null;
  }
  
  return statusFlow[currentIndex + 1];
};

export function Leads() {
  const [leadsData, setLeadsData] = useState<Lead[]>(leadsWithNotes);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const [letterRecipient, setLetterRecipient] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [currentTab, setCurrentTab] = useState('All');
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

  const handleAddLead = (newLead: Lead) => {
    setLeadsData(prevLeads => [newLead, ...prevLeads]);
    
    toast({
      title: "Lead added",
      description: `${newLead.name} has been added to your leads.`
    });
  };

  const handleQuickCall = () => {
    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    window.location.href = `tel:${phoneNumber}`;
    
    toast({
      title: "Initiating call",
      description: `Calling ${phoneNumber}`,
    });
    
    setQuickCallDialogOpen(false);
    setPhoneNumber('');
  };
  
  const handleQuickSms = () => {
    if (!smsRecipient || !smsText) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and message.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "SMS sent",
      description: `Message sent to ${smsRecipient}`,
    });
    
    setQuickSmsDialogOpen(false);
    setSmsRecipient('');
    setSmsText('');
  };
  
  const handleQuickLetter = () => {
    if (!letterRecipient || !letterContent) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and letter content.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Letter queued",
      description: `Letter to ${letterRecipient} has been queued for sending`,
    });
    
    setQuickLetterDialogOpen(false);
    setLetterRecipient('');
    setLetterContent('');
  };

  const handleFlagLead = (leadId: string, flagged: boolean) => {
    setLeadsData(prevLeads =>
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            flaggedForNextStage: flagged
          };
        }
        return lead;
      })
    );

    const lead = leadsData.find(l => l.id === leadId);
    if (lead) {
      const nextStage = getNextStage(lead.status);
      
      toast({
        title: flagged ? "Lead flagged" : "Flag removed",
        description: flagged 
          ? `${lead.name} is flagged to move to ${nextStage}.` 
          : `Flag removed from ${lead.name}.`
      });
    }
  };

  const handleMoveToNextStage = (lead: Lead) => {
    const nextStage = getNextStage(lead.status);
    
    if (!nextStage) {
      toast({
        title: "Cannot move lead",
        description: `${lead.name} is already at the final stage.`,
        variant: "destructive"
      });
      return;
    }
    
    setLeadsData(prevLeads =>
      prevLeads.map(l => {
        if (l.id === lead.id) {
          return {
            ...l,
            status: nextStage,
            flaggedForNextStage: false,
          };
        }
        return l;
      })
    );
    
    toast({
      title: "Lead moved",
      description: `${lead.name} has been moved to ${nextStage}.`
    });
  };

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuickCallDialogOpen(true)}
            className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-200"
          >
            <Phone className="h-4 w-4" />
            <span>Quick Call</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuickSmsDialogOpen(true)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Quick SMS</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuickLetterDialogOpen(true)}
            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200"
          >
            <FileText className="h-4 w-4" />
            <span>Quick Letter</span>
          </Button>
          <Button 
            className="flex items-center gap-2 animate-scale-in"
            onClick={() => setAddLeadModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-800">Lead stage progression</h3>
          <p className="text-sm text-blue-700 mt-1">
            Leads that are ready to move to the next stage are lightly highlighted. 
            You can manually flag leads using the <Flag className="h-3.5 w-3.5 inline mx-1" /> icon, 
            and move them to the next stage using the <ArrowRight className="h-3.5 w-3.5 inline mx-1" /> icon.
          </p>
        </div>
      </div>
      
      <AddLeadModal 
        open={addLeadModalOpen}
        onOpenChange={setAddLeadModalOpen}
        onLeadAdded={handleAddLead}
      />
      
      <Dialog open={quickCallDialogOpen} onOpenChange={setQuickCallDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Quick Call</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                type="tel"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCallDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickCall} className="bg-green-600 hover:bg-green-700">
              Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={quickSmsDialogOpen} onOpenChange={setQuickSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Quick SMS</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="smsRecipient" className="text-sm font-medium">
                Recipient Phone Number
              </label>
              <Input
                id="smsRecipient"
                value={smsRecipient}
                onChange={(e) => setSmsRecipient(e.target.value)}
                placeholder="(555) 123-4567"
                type="tel"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quickSmsText" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="quickSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickSmsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickSms} className="bg-blue-600 hover:bg-blue-700">
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={quickLetterDialogOpen} onOpenChange={setQuickLetterDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send a Quick Letter</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="letterRecipient" className="text-sm font-medium">
                Recipient Name/Address
              </label>
              <Input
                id="letterRecipient"
                value={letterRecipient}
                onChange={(e) => setLetterRecipient(e.target.value)}
                placeholder="John Smith, 123 Main St, Anytown, USA"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="letterContent" className="text-sm font-medium">
                Letter Content
              </label>
              <Textarea
                id="letterContent"
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                placeholder="Type your letter content here..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickLetterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickLetter} className="bg-amber-600 hover:bg-amber-700">
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Tabs 
        defaultValue="All" 
        className="w-full animate-scale-in"
        onValueChange={(value) => setCurrentTab(value)}
      >
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
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="New" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'New')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="Contacted" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Contacted')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="Qualified" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Qualified')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="Negotiating" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Negotiating')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="Closed" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Closed')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
        
        <TabsContent value="Lost" className="space-y-6 mt-6">
          <LeadTable 
            data={filterLeadsByStatus(leadsData, 'Lost')} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onAddNote={handleAddNote}
            onFlagLead={handleFlagLead}
            onMoveToNextStage={handleMoveToNextStage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Leads;
