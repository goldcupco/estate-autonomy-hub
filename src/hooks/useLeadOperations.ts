
import { useState } from 'react';
import { Lead, Note } from '@/components/leads/types';
import { getNextStage } from '@/components/leads/LeadData';
import { useToast } from "@/hooks/use-toast";
import { updateLead, addNote, addLead, deleteLead } from '@/services/leadService';
import { v4 as uuidv4 } from 'uuid';

export function useLeadOperations(leadsData: Lead[], setLeadsData: React.Dispatch<React.SetStateAction<Lead[]>>) {
  const { toast } = useToast();
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);

  const handleEditLead = async (updatedLead: Lead) => {
    try {
      const leadToUpdate = leadsData.find(lead => lead.id === updatedLead.id);
      const statusChanged = leadToUpdate && leadToUpdate.status !== updatedLead.status;
      
      if (statusChanged) {
        const newNote: Note = {
          id: uuidv4(),
          text: `Status changed from ${leadToUpdate?.status} to ${updatedLead.status}`,
          type: 'stage_change',
          timestamp: new Date().toISOString(),
          metadata: {
            previousStage: leadToUpdate?.status,
            newStage: updatedLead.status
          }
        };
        
        updatedLead.notes = [...(updatedLead.notes || []), newNote];
      }
      
      // Update in the database
      await updateLead(updatedLead);
      
      // Update the UI
      setLeadsData(prevLeads => 
        prevLeads.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );
      
      toast({
        title: "Lead updated",
        description: `${updatedLead.name} has been updated successfully.`
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      
      // Still update the UI for better UX
      setLeadsData(prevLeads => 
        prevLeads.map(lead => 
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );
      
      toast({
        title: "Update partially successful",
        description: "Lead updated in UI but database update failed",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async (leadId: string, note: Omit<Note, 'id'>) => {
    try {
      // Add note to the database
      const newNote = await addNote(leadId, note);
      
      // Update the UI
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
    } catch (error) {
      console.error('Error adding note:', error);
      
      // Still update the UI with a temporary note for better UX
      const tempNote: Note = {
        ...note,
        id: `temp-${Date.now()}`
      };
      
      setLeadsData(prevLeads =>
        prevLeads.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              lastContact: new Date().toISOString().split('T')[0],
              notes: [...(lead.notes || []), tempNote]
            };
          }
          return lead;
        })
      );
      
      toast({
        title: "Failed to save note",
        description: "The note was added locally but not saved to the database",
        variant: "destructive"
      });
    }
  };

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'dateAdded' | 'lastContact' | 'notes' | 'flaggedForNextStage' | 'readyToMove' | 'doNotContact'>) => {
    try {
      // Add lead to the database
      const newLead = await addLead(newLeadData);
      
      // Update the UI
      setLeadsData(prevLeads => [newLead, ...prevLeads]);
      
      toast({
        title: "Lead added",
        description: `${newLead.name} has been added to your leads.`
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      
      // Create a temporary lead for the UI
      const tempLead: Lead = {
        ...newLeadData,
        id: `temp-${Date.now()}`,
        dateAdded: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        notes: [],
        flaggedForNextStage: false,
        readyToMove: false,
        doNotContact: false
      };
      
      setLeadsData(prevLeads => [tempLead, ...prevLeads]);
      
      toast({
        title: "Database error",
        description: "Lead was added locally but not saved to database",
        variant: "destructive"
      });
    }
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

  const handleToggleDoNotContact = async (leadId: string, doNotContact: boolean) => {
    try {
      // Find the lead to update
      const leadToUpdate = leadsData.find(lead => lead.id === leadId);
      if (!leadToUpdate) {
        throw new Error('Lead not found');
      }
      
      // Add a note about the change
      const newNote: Note = {
        id: uuidv4(),
        text: doNotContact 
          ? 'Lead marked as Do Not Contact'
          : 'Do Not Contact flag removed',
        type: 'other',
        timestamp: new Date().toISOString()
      };
      
      const updatedLead: Lead = {
        ...leadToUpdate,
        doNotContact,
        notes: [...(leadToUpdate.notes || []), newNote]
      };
      
      // Update in database
      await updateLead(updatedLead);
      
      // Update the UI
      setLeadsData(prevLeads =>
        prevLeads.map(lead => {
          if (lead.id === leadId) {
            return updatedLead;
          }
          return lead;
        })
      );
      
      const lead = leadsData.find(l => l.id === leadId);
      if (lead) {
        toast({
          title: doNotContact ? "Do Not Contact flag added" : "Do Not Contact flag removed",
          description: doNotContact
            ? `${lead.name} has been marked as Do Not Contact.`
            : `${lead.name} can now be contacted.`
        });
      }
    } catch (error) {
      console.error('Error updating do not contact status:', error);
      
      // Still update the UI for better UX
      setLeadsData(prevLeads =>
        prevLeads.map(lead => {
          if (lead.id === leadId) {
            const newNote: Note = {
              id: `temp-${Date.now()}`,
              text: doNotContact 
                ? 'Lead marked as Do Not Contact'
                : 'Do Not Contact flag removed',
              type: 'other',
              timestamp: new Date().toISOString()
            };
            
            return {
              ...lead,
              doNotContact,
              notes: [...(lead.notes || []), newNote]
            };
          }
          return lead;
        })
      );
      
      const lead = leadsData.find(l => l.id === leadId);
      if (lead) {
        toast({
          title: doNotContact ? "Do Not Contact flag added" : "Do Not Contact flag removed",
          description: `Updated locally but failed to save to database.`,
          variant: "destructive"
        });
      }
    }
  };

  const handleMoveToNextStage = async (lead: Lead) => {
    const nextStage = getNextStage(lead.status);
    
    if (!nextStage) {
      toast({
        title: "Cannot move lead",
        description: `${lead.name} is already at the final stage.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const stageChangeNote: Note = {
        id: uuidv4(),
        text: `Status changed from ${lead.status} to ${nextStage}`,
        type: 'stage_change',
        timestamp: new Date().toISOString(),
        metadata: {
          previousStage: lead.status,
          newStage: nextStage as Lead['status']
        }
      };
      
      const updatedLead: Lead = {
        ...lead,
        status: nextStage as Lead['status'],
        flaggedForNextStage: false,
        notes: [...(lead.notes || []), stageChangeNote]
      };
      
      // Update in database
      await updateLead(updatedLead);
      
      // Update the UI
      setLeadsData(prevLeads =>
        prevLeads.map(l => {
          if (l.id === lead.id) {
            return updatedLead;
          }
          return l;
        })
      );
      
      toast({
        title: "Lead moved",
        description: `${lead.name} has been moved to ${nextStage}.`
      });
    } catch (error) {
      console.error('Error moving lead to next stage:', error);
      
      // Still update the UI for better UX
      setLeadsData(prevLeads =>
        prevLeads.map(l => {
          if (l.id === lead.id) {
            const stageChangeNote: Note = {
              id: `temp-${Date.now()}`,
              text: `Status changed from ${lead.status} to ${nextStage}`,
              type: 'stage_change',
              timestamp: new Date().toISOString(),
              metadata: {
                previousStage: lead.status,
                newStage: nextStage as Lead['status']
              }
            };
            
            return {
              ...l,
              status: nextStage as Lead['status'],
              flaggedForNextStage: false,
              notes: [...(l.notes || []), stageChangeNote]
            };
          }
          return l;
        })
      );
      
      toast({
        title: "Lead moved locally",
        description: `${lead.name} was moved in UI but database update failed.`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const leadToDelete = leadsData.find(lead => lead.id === leadId);
    
    try {
      // Delete from database
      await deleteLead(leadId);
      
      // Update the UI
      setLeadsData(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      if (leadToDelete) {
        toast({
          title: "Lead deleted",
          description: `${leadToDelete.name} has been removed from your leads.`
        });
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      
      // Still update the UI for better UX
      setLeadsData(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      if (leadToDelete) {
        toast({
          title: "Lead deleted from UI",
          description: `${leadToDelete.name} was removed from UI but database delete failed.`,
          variant: "destructive"
        });
      }
    }
  };

  return {
    quickCallDialogOpen,
    setQuickCallDialogOpen,
    quickSmsDialogOpen,
    setQuickSmsDialogOpen,
    quickLetterDialogOpen,
    setQuickLetterDialogOpen,
    handleEditLead,
    handleAddNote,
    handleAddLead,
    handleFlagLead,
    handleToggleDoNotContact,
    handleMoveToNextStage,
    handleDeleteLead
  };
}
