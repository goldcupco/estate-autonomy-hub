
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { ensureMetricsFormat, mapDbRowToCampaign } from './types';

// Create a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign | null> => {
  try {
    console.log("Creating new campaign with data:", campaign);
    
    // Format the campaign data for the database
    const campaignData = {
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.startDate || null,
      end_date: campaign.endDate || null,
      created_by: campaign.createdBy,
      assigned_users: campaign.assignedUsers || [],
      budget: campaign.budget || 0,
      metrics: ensureMetricsFormat(campaign.metrics),
      access_restricted: campaign.accessRestricted || false,
      user_id: campaign.createdBy // Using createdBy as the user_id which is essential for RLS
    };
    
    console.log("Formatted campaign data for insert:", campaignData);
    
    // Create the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
      return null;
    }
    
    if (!data) {
      toast.error('Failed to create campaign: No data returned');
      return null;
    }
    
    toast.success('Campaign created successfully');
    return mapDbRowToCampaign(data);
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    toast.error(`Failed to create campaign: ${error.message}`);
    return null;
  }
};
