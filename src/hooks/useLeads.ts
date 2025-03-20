
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lead } from '@/components/leads/types';
import { useToast } from "@/hooks/use-toast";
import { fetchLeads } from '@/services/leadService';
import { initialLeadsData } from '@/components/leads/LeadData';

export function useLeads() {
  const [searchParams] = useSearchParams();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('All');
  const { toast } = useToast();

  useEffect(() => {
    async function loadLeads() {
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
    }
    
    loadLeads();
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

  return {
    leadsData,
    setLeadsData,
    isLoading,
    currentTab,
    setCurrentTab,
    toast
  };
}
