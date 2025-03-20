
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { CampaignData, mapDbRowToCampaign } from './types';

// Add a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign | null> => {
  try {
    // Format the data for the database
    const campaignData: CampaignData = {
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      created_by: campaign.createdBy,
      assigned_users: campaign.assignedUsers,
      budget: campaign.budget,
      metrics: campaign.metrics || {
        contacts: 0,
        responses: 0,
        conversions: 0
      },
      access_restricted: campaign.accessRestricted,
      user_id: 'system'
    };
    
    console.log("Creating new campaign:", campaignData);
    
    // Use the admin RPC function to create a campaign
    const { data, error } = await supabase.rpc('admin_create_campaign', {
      campaign_data: campaignData
    });
    
    if (error) {
      console.error('Error creating campaign:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
      return null;
    }
    
    if (!data) {
      console.error('No data returned from campaign creation');
      toast.error('Failed to create campaign: No data returned');
      return null;
    }
    
    // Cast the data to the correct type and parse it
    const campaignRecord = data as any;
    
    toast.success('Campaign created successfully');
    
    return mapDbRowToCampaign(campaignRecord);
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    toast.error(`Failed to create campaign: ${error.message}`);
    return null;
  }
};
