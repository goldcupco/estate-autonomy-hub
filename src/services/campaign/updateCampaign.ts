
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';

// Update an existing campaign
export const updateCampaign = async (id: string, updates: Partial<Omit<Campaign, 'id'>>): Promise<boolean> => {
  try {
    // Format the data for the database
    const campaignData: any = {};
    
    if (updates.name) campaignData.name = updates.name;
    if (updates.description !== undefined) campaignData.description = updates.description;
    if (updates.status) campaignData.status = updates.status;
    if (updates.type) campaignData.type = updates.type;
    if (updates.startDate) campaignData.start_date = updates.startDate;
    if (updates.endDate) campaignData.end_date = updates.endDate;
    if (updates.createdBy) campaignData.created_by = updates.createdBy;
    if (updates.assignedUsers) campaignData.assigned_users = updates.assignedUsers;
    if (updates.budget !== undefined) campaignData.budget = updates.budget;
    if (updates.metrics) campaignData.metrics = updates.metrics;
    if (updates.accessRestricted !== undefined) campaignData.access_restricted = updates.accessRestricted;
    
    console.log("Updating campaign with ID:", id, "Data:", campaignData);
    
    // Use the admin RPC function to update a campaign
    const { error } = await supabase.rpc('admin_update_campaign', {
      campaign_id: id,
      campaign_data: campaignData
    });
    
    if (error) {
      console.error('Error updating campaign:', error);
      toast.error(`Failed to update campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Campaign updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error in updateCampaign:', error);
    toast.error(`Failed to update campaign: ${error.message}`);
    return false;
  }
};
