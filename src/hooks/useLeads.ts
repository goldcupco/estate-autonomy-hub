
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lead, Note } from '@/components/leads/types';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { initialLeadsData, getNextStage } from '@/components/leads/LeadData';
import { supabase } from '@/utils/supabaseClient';

export function useLeads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return {
    leadsData,
    setLeadsData,
    isLoading,
    currentTab,
    setCurrentTab,
    toast
  };
}
