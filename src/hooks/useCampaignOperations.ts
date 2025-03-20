import { useState } from 'react';
import { Campaign } from '../models/Campaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  createCampaign as createCampaignService, 
  updateCampaign as updateCampaignService,
  deleteCampaign as deleteCampaignService,
  addLeadToCampaign as addLeadToCampaignService,
  removeLeadFromCampaign as removeLeadFromCampaignService
} from '../services/campaign';
import { useAuth } from '@/contexts/AuthContext';

export function useCampaignOperations(
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  refreshCampaigns: () => Promise<Campaign[]>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAuthenticated } = useAuth();

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const addCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<string> => {
    setLoading(true);
    try {
      console.log("Adding campaign with data:", campaignData);
      
      // First check if we have a currentUser from our AuthContext
      if (currentUser) {
        console.log("Using AuthContext user:", currentUser.id);
        
        // Use authenticated user ID for both createdBy and user_id if not provided
        const campaignWithAuthUser = {
          ...campaignData,
          createdBy: campaignData.createdBy || currentUser.id,
          user_id: currentUser.id // This is crucial for Supabase RLS!
        };
        
        console.log("Sending campaign with auth data:", campaignWithAuthUser);
        
        const newCampaign = await createCampaignService(campaignWithAuthUser);
        if (newCampaign) {
          console.log("Campaign added successfully:", newCampaign);
          await refreshCampaigns(); // Refresh all campaigns to ensure we have the latest data
          return newCampaign.id;
        } else {
          throw new Error("Failed to create campaign");
        }
      } else {
        // If no currentUser from AuthContext, try getting the session directly
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error("Authentication error: " + sessionError.message);
        }
        
        const session = sessionData?.session;
        const userId = session?.user?.id;
        
        if (!userId) {
          console.error("No authenticated user found");
          throw new Error("You must be logged in to create a campaign");
        }
        
        // Use the userId from session
        const campaignWithSessionUser = {
          ...campaignData,
          createdBy: campaignData.createdBy || userId,
          user_id: userId
        };
        
        console.log("Sending campaign with session user:", campaignWithSessionUser);
        
        const newCampaign = await createCampaignService(campaignWithSessionUser);
        if (newCampaign) {
          console.log("Campaign added successfully:", newCampaign);
          await refreshCampaigns();
          return newCampaign.id;
        } else {
          throw new Error("Failed to create campaign");
        }
      }
    } catch (err: any) {
      console.error("Error in addCampaign:", err);
      setError(err.message || "Failed to add campaign");
      toast.error(err.message || "Failed to add campaign");
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
