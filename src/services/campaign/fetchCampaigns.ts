
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { mapDbRowToCampaign } from './types';

// Fetch all campaigns from the database
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
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
      return data.map(campaign => mapDbRowToCampaign(campaign));
    }
    
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
      return mapDbRowToCampaign(data);
    }
    
    return null;
  } catch (error: any) {
    console.error('Error in getCampaignById:', error);
    return null;
  }
};
