
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { mapDbRowToCampaign } from './types';

// Fetch all campaigns from the database
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    console.log("Fetching campaigns from database...");
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_leads(lead_id)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      toast.error(`Error fetching campaigns: ${error.message}`);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} campaigns`);
      return data.map(campaign => mapDbRowToCampaign(campaign));
    }
    
    console.log("No campaigns found");
    return [];
  } catch (error: any) {
    console.error('Error in fetchCampaigns:', error);
    toast.error(`Failed to fetch campaigns: ${error.message}`);
    return [];
  }
};

// Get a single campaign by ID
export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    console.log(`Fetching campaign with ID: ${id}`);
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_leads(lead_id)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
    
    if (data) {
      console.log('Campaign found:', data);
      return mapDbRowToCampaign(data);
    }
    
    console.log('Campaign not found');
    return null;
  } catch (error: any) {
    console.error('Error in getCampaignById:', error);
    return null;
  }
};
