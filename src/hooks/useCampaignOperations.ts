
import { useState } from 'react';
import { Campaign } from '../models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { 
  createCampaign as createCampaignService, 
  updateCampaign as updateCampaignService,
  deleteCampaign as deleteCampaignService,
  addLeadToCampaign as addLeadToCampaignService,
  removeLeadFromCampaign as removeLeadFromCampaignService
} from '../services/campaign';

export function useCampaignOperations(
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  refreshCampaigns: () => Promise<Campaign[]>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const addCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<string> => {
    setLoading(true);
    try {
      console.log("Adding campaign with data:", campaignData);
      
      // Explicitly ensure we have current user auth before creating a campaign
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user?.id && !campaignData.createdBy) {
        console.error("No authenticated user found and no createdBy provided");
        throw new Error("You must be logged in to create a campaign");
      }
      
      // Use authenticated user ID for createdBy if not provided
      const campaignWithAuthUser = {
        ...campaignData,
        createdBy: campaignData.createdBy || authData.user?.id
      };
      
      const newCampaign = await createCampaignService(campaignWithAuthUser);
      if (newCampaign) {
        console.log("Campaign added successfully:", newCampaign);
        await refreshCampaigns(); // Refresh all campaigns to ensure we have the latest data
        return newCampaign.id;
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (err: any) {
      console.error("Error in addCampaign:", err);
      setError(err.message || "Failed to add campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Omit<Campaign, 'id'>>) => {
    setLoading(true);
    try {
      const success = await updateCampaignService(id, updates);
      if (success) {
        setCampaigns(campaigns.map(campaign => 
          campaign.id === id ? { ...campaign, ...updates } : campaign
        ));
      } else {
        throw new Error("Failed to update campaign");
      }
    } catch (err: any) {
      console.error("Error in updateCampaign:", err);
      setError(err.message || "Failed to update campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setLoading(true);
    try {
      const success = await deleteCampaignService(id);
      if (success) {
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      } else {
        throw new Error("Failed to delete campaign");
      }
    } catch (err: any) {
      console.error("Error in deleteCampaign:", err);
      setError(err.message || "Failed to delete campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getCampaign,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    loading,
    error
  };
}
