
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LeadTable, { Lead, Note } from '@/components/leads/LeadTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { QuickCallDialog } from '@/components/leads/quick-actions/QuickCallDialog';
import { QuickSmsDialog } from '@/components/leads/quick-actions/QuickSmsDialog';
import { QuickLetterDialog } from '@/components/leads/quick-actions/QuickLetterDialog';
import { LeadQuickActions } from '@/components/leads/quick-actions/LeadQuickActions';
import { LeadInfoBanner } from '@/components/leads/LeadInfoBanner';
import { initialLeadsData, getNextStage } from '@/components/leads/LeadData';

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

export function Leads() {
  const [leadsData, setLeadsData] = useState<Lead[]>(leadsWithNotes);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
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

  const handleFlagLead = (leadId: string, flagged: boolean) => {
    console.log("Leads: handleFlagLead called with:", leadId, flagged);
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
    console.log("Leads: handleMoveToNextStage called with:", lead);
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
          <LeadQuickActions 
            onOpenCall={() => setQuickCallDialogOpen(true)}
            onOpenSms={() => setQuickSmsDialogOpen(true)} 
            onOpenLetter={() => setQuickLetterDialogOpen(true)}
          />
          <Button 
            className="flex items-center gap-2 animate-scale-in"
            onClick={() => setAddLeadModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>
      
      <LeadInfoBanner />
      
      <AddLeadModal 
        open={addLeadModalOpen}
        onOpenChange={setAddLeadModalOpen}
        onLeadAdded={handleAddLead}
      />
      
      <QuickCallDialog 
        open={quickCallDialogOpen} 
        onOpenChange={setQuickCallDialogOpen} 
      />
      
      <QuickSmsDialog 
        open={quickSmsDialogOpen} 
        onOpenChange={setQuickSmsDialogOpen} 
      />
      
      <QuickLetterDialog 
        open={quickLetterDialogOpen} 
        onOpenChange={setQuickLetterDialogOpen} 
      />
      
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
