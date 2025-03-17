import { useState } from 'react';
import { Lead, Note } from '@/components/leads/types';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { LeadInfoBanner } from '@/components/leads/LeadInfoBanner';
import { LeadHeader } from '@/components/leads/LeadHeader';
import { LeadQuickActionDialogs } from '@/components/leads/LeadQuickActionDialogs';
import { LeadTabs } from '@/components/leads/LeadTabs';
import { initialLeadsData, getNextStage } from '@/components/leads/LeadData';

// Process initial leads data
const leadsWithNotes = initialLeadsData.map(lead => ({
  ...lead,
  notes: lead.notes || [],
  flaggedForNextStage: false,
  readyToMove: false,
  doNotContact: false
}));

export function Leads() {
  const [leadsData, setLeadsData] = useState<Lead[]>(leadsWithNotes);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('All');
  const { toast } = useToast();

  const handleEditLead = (updatedLead: Lead) => {
    console.log("Leads: handleEditLead called", updatedLead);
    setLeadsData(prevLeads => 
      prevLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
    
    toast({
      title: "Lead updated",
      description: `${updatedLead.name} has been updated successfully.`
    });
  };

  const handleAddNote = (leadId: string, note: Omit<Note, 'id'>) => {
    console.log("Leads: handleAddNote called", leadId, note);
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
    console.log("Leads: handleAddLead called", newLead);
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
            status: nextStage as Lead['status'],
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

  const handleDeleteLead = (leadId: string) => {
    console.log("Leads: handleDeleteLead called with:", leadId);
    
    // Find the lead before deleting it
    const leadToDelete = leadsData.find(lead => lead.id === leadId);
    
    // Simple approach - just filter out the lead with the given ID
    setLeadsData(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    
    // Show success toast if the lead was found
    if (leadToDelete) {
      toast({
        title: "Lead deleted",
        description: `${leadToDelete.name} has been removed from your leads.`
      });
    }
  };

  const handleToggleDoNotContact = (leadId: string) => {
    console.log("Leads: handleToggleDoNotContact called with:", leadId);
    
    // Find the lead before toggling the flag
    const lead = leadsData.find(l => l.id === leadId);
    
    if (!lead) return;
    
    const newDoNotContactValue = !lead.doNotContact;
    
    // Toggle the doNotContact flag
    setLeadsData(prevLeads => 
      prevLeads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            doNotContact: newDoNotContactValue
          };
        }
        return l;
      })
    );
    
    // Show toast
    toast({
      title: newDoNotContactValue ? "Do Not Contact Flag Added" : "Do Not Contact Flag Removed",
      description: newDoNotContactValue 
        ? `${lead.name} has been flagged as Do Not Contact.` 
        : `Do Not Contact flag removed from ${lead.name}.`
    });
  };

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <LeadHeader 
        onLeadAdded={handleAddLead}
        onOpenCall={() => setQuickCallDialogOpen(true)}
        onOpenSms={() => setQuickSmsDialogOpen(true)}
        onOpenLetter={() => setQuickLetterDialogOpen(true)}
      />
      
      <LeadInfoBanner />
      
      <LeadQuickActionDialogs 
        quickCallDialogOpen={quickCallDialogOpen}
        setQuickCallDialogOpen={setQuickCallDialogOpen}
        quickSmsDialogOpen={quickSmsDialogOpen}
        setQuickSmsDialogOpen={setQuickSmsDialogOpen}
        quickLetterDialogOpen={quickLetterDialogOpen}
        setQuickLetterDialogOpen={setQuickLetterDialogOpen}
      />
      
      <LeadTabs 
        leadsData={leadsData}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onEditLead={handleEditLead}
        onAddNote={handleAddNote}
        onFlagLead={handleFlagLead}
        onMoveToNextStage={handleMoveToNextStage}
        onToggleDoNotContact={handleToggleDoNotContact}
      />
    </div>
  );
}

export default Leads;
