
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { ensureMetricsFormat, mapDbRowToCampaign } from './types';

// Create a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign | null> => {
  try {
    console.log("Creating new campaign with data:", campaign);
    
    // Get current authenticated user
    const { data: authData } = await supabase.auth.getUser();
    const authenticatedUserId = authData?.user?.id;
    
    // Make sure we have a valid user ID for RLS
    if (!authenticatedUserId && !campaign.createdBy) {
      console.error('No authenticated user or createdBy found');
      toast.error('You must be logged in to create a campaign');
      return null;
    }
    
    // Use authenticated user ID if createdBy is not provided
    const userIdToUse = campaign.createdBy || authenticatedUserId;
    
    // Format the campaign data for the database
    const campaignData = {
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.startDate || null,
      end_date: campaign.endDate || null,
      created_by: userIdToUse,
      assigned_users: campaign.assignedUsers || [],
      budget: campaign.budget || 0,
      metrics: ensureMetricsFormat(campaign.metrics),
      access_restricted: campaign.accessRestricted || false,
      user_id: userIdToUse // Critical for RLS
    };
    
    console.log("Formatted campaign data for insert:", campaignData);
    
    // First check if a similar campaign already exists to avoid duplicates
    const { data: existingCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('name', campaignData.name)
      .eq('user_id', campaignData.user_id);
    
    if (existingCampaigns && existingCampaigns.length > 0) {
      console.log("Campaign with this name already exists:", existingCampaigns);
      toast.error(`A campaign with the name "${campaignData.name}" already exists`);
      return null;
    }
    
    // Create the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      
      // Enhanced error message based on error code
      if (error.code === '42501') {
        toast.error('Permission denied: You do not have access to create campaigns');
      } else if (error.code === '23505') {
        toast.error('A campaign with this name already exists');
      } else {
        toast.error(`Failed to create campaign: ${error.message}`);
      }
      
      return null;
    }
    
    if (!data) {
      toast.error('Failed to create campaign: No data returned');
      return null;
    }
    
    toast.success('Campaign created successfully');
    console.log("Campaign created successfully:", data);
    return mapDbRowToCampaign(data);
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    toast.error(`Failed to create campaign: ${error.message}`);
    return null;
  }
};
