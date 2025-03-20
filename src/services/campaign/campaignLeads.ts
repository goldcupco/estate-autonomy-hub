
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Add a lead to a campaign
export const addLeadToCampaign = async (campaignId: string, leadId: string): Promise<boolean> => {
  try {
    console.log(`Adding lead ${leadId} to campaign ${campaignId}`);
    
    const { error } = await supabase
      .from('campaign_leads')
      .insert({
        campaign_id: campaignId,
        lead_id: leadId
      });
    
    if (error) {
      console.error('Error adding lead to campaign:', error);
      toast.error(`Failed to add lead to campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Lead added to campaign successfully');
    return true;
  } catch (error: any) {
    console.error('Error in addLeadToCampaign:', error);
    toast.error(`Failed to add lead to campaign: ${error.message}`);
    return false;
  }
};

// Remove a lead from a campaign
export const removeLeadFromCampaign = async (campaignId: string, leadId: string): Promise<boolean> => {
  try {
    console.log(`Removing lead ${leadId} from campaign ${campaignId}`);
    
    const { error } = await supabase
      .from('campaign_leads')
      .delete()
      .match({
        campaign_id: campaignId,
        lead_id: leadId
      });
    
    if (error) {
      console.error('Error removing lead from campaign:', error);
      toast.error(`Failed to remove lead from campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Lead removed from campaign successfully');
    return true;
  } catch (error: any) {
    console.error('Error in removeLeadFromCampaign:', error);
    toast.error(`Failed to remove lead from campaign: ${error.message}`);
    return false;
  }
};

// Get all leads for a campaign
export const getCampaignLeads = async (campaignId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('campaign_leads')
      .select('lead_id')
      .eq('campaign_id', campaignId);
    
    if (error) {
      console.error('Error fetching campaign leads:', error);
      return [];
    }
    
    return data.map(item => item.lead_id);
  } catch (error: any) {
    console.error('Error in getCampaignLeads:', error);
    return [];
  }
};
