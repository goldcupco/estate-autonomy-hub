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
import { supabase } from '@/utils/supabaseClient';

export function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [quickLetterDialogOpen, setQuickLetterDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('All');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLeads() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching leads:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const formattedLeads: Lead[] = data.map(lead => ({
            id: lead.id,
            name: `${lead.first_name} ${lead.last_name}`,
            email: lead.email || '',
            phone: lead.phone || '',
            status: lead.status as Lead['status'],
            source: lead.lead_source || 'Unknown',
            dateAdded: new Date(lead.created_at).toISOString().split('T')[0],
            lastContact: lead.last_contact_date 
              ? new Date(lead.last_contact_date).toISOString().split('T')[0] 
              : new Date(lead.created_at).toISOString().split('T')[0],
            notes: [],
            flaggedForNextStage: false,
            readyToMove: false,
            doNotContact: false
          }));
          
          setLeadsData(formattedLeads);
        } else {
          console.log('No leads found in database, using sample data');
          
          const leadsWithNotes = initialLeadsData.map(lead => ({
            ...lead,
            notes: lead.notes || [],
            flaggedForNextStage: false,
            readyToMove: false,
            doNotContact: false
          }));
          
          setLeadsData(leadsWithNotes);
        }
      } catch (err) {
        console.error('Failed to fetch leads, using sample data:', err);
        
        const leadsWithNotes = initialLeadsData.map(lead => ({
          ...lead,
          notes: lead.notes || [],
          flaggedForNextStage: false,
          readyToMove: false,
          doNotContact: false
        }));
        
        setLeadsData(leadsWithNotes);
        
        toast({
          title: "Connection issue",
          description: "Using sample data due to database connection issues",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeads();
  }, [toast]);

  useEffect(() => {
    const searchTerm = searchParams.get('search');
    if (searchTerm && leadsData.length > 0) {
      const leadName = decodeURIComponent(searchTerm);
      const matchingLead = leadsData.find(lead => 
        lead.name.toLowerCase() === leadName.toLowerCase()
      );
      
      if (matchingLead) {
        setCurrentTab(matchingLead.status);
        
        toast({
          title: "Contact found",
          description: `Showing details for ${leadName}`
        });
      } else {
        setCurrentTab('All');
        
        toast({
          title: "Searching for contact",
          description: `Showing results for "${leadName}"`
        });
      }
    }
  }, [searchParams, leadsData, toast]);

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
        variant: "warning"
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
        variant: "warning"
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
        isLoading={isLoading}
      />
    </div>
  );
}

export default Leads;
