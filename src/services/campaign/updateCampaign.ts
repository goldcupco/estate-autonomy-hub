
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { ensureMetricsFormat } from './types';

// Update an existing campaign
export const updateCampaign = async (id: string, campaign: Partial<Campaign>): Promise<boolean> => {
  try {
    console.log("Updating campaign with ID:", id);
    console.log("Update data:", campaign);
    
    // Format the campaign data for the database
    const updateData: any = {};
    
    if (campaign.name !== undefined) updateData.name = campaign.name;
    if (campaign.description !== undefined) updateData.description = campaign.description;
    if (campaign.status !== undefined) updateData.status = campaign.status;
    if (campaign.type !== undefined) updateData.type = campaign.type;
    if (campaign.startDate !== undefined) updateData.start_date = campaign.startDate;
    if (campaign.endDate !== undefined) updateData.end_date = campaign.endDate;
    if (campaign.assignedUsers !== undefined) updateData.assigned_users = campaign.assignedUsers;
    if (campaign.budget !== undefined) updateData.budget = campaign.budget;
    if (campaign.metrics !== undefined) updateData.metrics = ensureMetricsFormat(campaign.metrics);
    if (campaign.accessRestricted !== undefined) updateData.access_restricted = campaign.accessRestricted;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update the campaign
    const { error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id);
    
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
