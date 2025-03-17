import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  doNotContact: false // Renamed from doNotCall
}));

export function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leadsData, setLeadsData] = useState<Lead[]>(leadsWithNotes);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('All');
  const { toast } = useToast();

  // Check for contact name in URL and filter leads accordingly
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      // Find the lead by name
      const leadName = decodeURIComponent(searchTerm);
      const matchingLead = leadsData.find(lead => 
        lead.name.toLowerCase() === leadName.toLowerCase()
      );
      
      if (matchingLead) {
        // Set the current tab to match the lead's status
        setCurrentTab(matchingLead.status);
        
        // Show toast notification
        toast({
          title: "Contact found",
          description: `Showing details for ${leadName}`
        });
      } else {
        // If no exact match, stay on All tab but set filter
        setCurrentTab('All');
        
        toast({
          title: "Searching for contact",
          description: `Showing results for "${leadName}"`
        });
      }
      
      // We'll keep the search parameter in the URL to ensure the table filter is applied
      // instead of clearing it immediately
    }
  }, [searchParams, leadsData, toast]);

  const handleEditLead = (updatedLead: Lead) => {
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

  const handleToggleDoNotContact = (leadId: string, doNotContact: boolean) => { // Renamed from handleToggleDoNotCall
    setLeadsData(prevLeads =>
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          return {
            ...lead,
            doNotContact // Renamed from doNotCall
          };
        }
        return lead;
      })
    );

    const lead = leadsData.find(l => l.id === leadId);
    if (lead) {
      toast({
        title: doNotContact ? "Do Not Contact flag added" : "Do Not Contact flag removed", // Updated text
        description: doNotContact
          ? `${lead.name} has been marked as Do Not Contact.` // Updated text
          : `${lead.name} can now be contacted.` // Updated text
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
        onToggleDoNotContact={handleToggleDoNotContact} // Renamed from onToggleDoNotCall
      />
    </div>
  );
}

export default Leads;
