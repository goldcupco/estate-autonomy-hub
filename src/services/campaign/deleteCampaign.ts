
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Delete a campaign
export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    console.log("Deleting campaign with ID:", id);
    
    // Use the admin RPC function to delete a campaign
    const { error } = await supabase.rpc('admin_delete_campaign', {
      campaign_id: id
    });
    
    if (error) {
      console.error('Error deleting campaign:', error);
      toast.error(`Failed to delete campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Campaign deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteCampaign:', error);
    toast.error(`Failed to delete campaign: ${error.message}`);
    return false;
  }
};
