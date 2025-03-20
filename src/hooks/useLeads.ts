
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lead } from '@/components/leads/types';
import { useToast } from "@/hooks/use-toast";
import { fetchLeads, addLead, updateLead, deleteLead, addNote } from '@/services/leadService';
import { initialLeadsData } from '@/components/leads/LeadData';

export function useLeads() {
  const [searchParams] = useSearchParams();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('All');
  const { toast } = useToast();

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const leads = await fetchLeads();
      
      if (leads && leads.length > 0) {
        setLeadsData(leads);
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
  }, [toast]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

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

  // Function to add a new lead with proper database commit
  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'dateAdded' | 'lastContact' | 'notes' | 'flaggedForNextStage' | 'readyToMove' | 'doNotContact'>) => {
    try {
      const createdLead = await addLead(newLead);
      setLeadsData(prev => [createdLead, ...prev]);
      return createdLead;
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };

  // Function to update a lead with proper database commit
  const handleUpdateLead = async (lead: Lead) => {
    try {
      await updateLead(lead);
      setLeadsData(prev => prev.map(item => item.id === lead.id ? lead : item));
      return lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  // Function to delete a lead with proper database commit
  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      setLeadsData(prev => prev.filter(lead => lead.id !== leadId));
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  };

  // Function to add a note to a lead with proper database commit
  const handleAddNote = async (leadId: string, note: Omit<Lead['notes'][0], 'id'>) => {
    try {
      const newNote = await addNote(leadId, note);
      
      setLeadsData(prev => 
        prev.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              notes: [...(lead.notes || []), newNote],
              lastContact: new Date().toISOString().split('T')[0]
            };
          }
          return lead;
        })
      );
      
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  return {
    leadsData,
    setLeadsData,
    isLoading,
    currentTab,
    setCurrentTab,
    toast,
    addLead: handleAddLead,
    updateLead: handleUpdateLead,
    deleteLead: handleDeleteLead,
    addNote: handleAddNote,
    refreshLeads: loadLeads
  };
}
