
import { useState } from 'react';
import { Lead, Note } from '@/components/leads/types';
import { v4 as uuidv4 } from 'uuid';
import { getNextStage } from '@/components/leads/LeadData';
import { supabase } from '@/utils/supabaseClient';
import { useToast } from "@/hooks/use-toast";

export function useLeadOperations(leadsData: Lead[], setLeadsData: React.Dispatch<React.SetStateAction<Lead[]>>) {
  const { toast } = useToast();
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);

  const handleEditLead = async (updatedLead: Lead) => {
    try {
      const leadToUpdate = leadsData.find(lead => lead.id === updatedLead.id);
      const statusChanged = leadToUpdate && leadToUpdate.status !== updatedLead.status;
      
      let newNote: Note | null = null;
      if (statusChanged) {
        newNote = {
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
      
      const [firstName, ...lastNameParts] = updatedLead.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const { error } = await supabase
        .from('leads')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          email: updatedLead.email,
          phone: updatedLead.phone,
          status: updatedLead.status,
          lead_source: updatedLead.source,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedLead.id);
      
      if (error) {
        throw error;
      }
      
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
      toast({
        title: "Update failed",
        description: "Failed to update lead in database",
        variant: "destructive"
      });
    }
  };

  const handleAddNote = async (leadId: string, note: Omit<Note, 'id'>) => {
    try {
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
      
      const { error } = await supabase
        .from('leads')
        .update({
          last_contact_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Note added",
        description: "Your note has been added to the lead."
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Failed to save note",
        description: "The note was added locally but not saved to the database",
        variant: "destructive"
      });
    }
  };

  const handleAddLead = async (newLead: Lead) => {
    try {
      const initialNote: Note = {
        id: uuidv4(),
        text: `Lead created with status: ${newLead.status}`,
        type: 'stage_change',
        timestamp: new Date().toISOString(),
        metadata: {
          newStage: newLead.status
        }
      };
      
      const leadWithNote = {
        ...newLead,
        notes: [initialNote]
      };
      
      const [firstName, ...lastNameParts] = newLead.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: firstName,
          last_name: lastName || '',
          email: newLead.email,
          phone: newLead.phone,
          status: newLead.status,
          lead_type: 'buyer',
          lead_source: newLead.source,
          user_id: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        leadWithNote.id = data[0].id;
      }
      
      setLeadsData(prevLeads => [leadWithNote, ...prevLeads]);
      
      toast({
        title: "Lead added",
        description: `${newLead.name} has been added to your leads.`
      });
    } catch (error) {
      console.error('Error adding lead:', error);
      
      setLeadsData(prevLeads => [newLead, ...prevLeads]);
      
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

  const handleToggleDoNotContact = (leadId: string, doNotContact: boolean) => {
    setLeadsData(prevLeads =>
      prevLeads.map(lead => {
        if (lead.id === leadId) {
          const newNote: Note = {
            id: uuidv4(),
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
        description: doNotContact
          ? `${lead.name} has been marked as Do Not Contact.`
          : `${lead.name} can now be contacted.`
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
    
    setLeadsData(prevLeads =>
      prevLeads.map(l => {
        if (l.id === lead.id) {
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
      title: "Lead moved",
      description: `${lead.name} has been moved to ${nextStage}.`
    });
  };

  const handleDeleteLead = (leadId: string) => {
    const leadToDelete = leadsData.find(lead => lead.id === leadId);
    
    setLeadsData(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
    
    if (leadToDelete) {
      toast({
        title: "Lead deleted",
        description: `${leadToDelete.name} has been removed from your leads.`
      });
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
