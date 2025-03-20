
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Add a lead to a campaign
export const addLeadToCampaign = async (campaignId: string, leadId: string): Promise<boolean> => {
  try {
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
