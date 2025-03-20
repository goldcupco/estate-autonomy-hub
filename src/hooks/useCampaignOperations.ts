import { useState, useEffect, useCallback } from 'react';
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
  const [userId, setUserId] = useState<string | null>(null);
  const { currentUser, isAuthenticated } = useAuth();

  // Effect to get and store the current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (currentUser) {
        setUserId(currentUser.id);
        console.log("Using user ID from AuthContext:", currentUser.id);
        return;
      }

      // If no currentUser from context, try to get from Supabase session
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          return;
        }
        
        if (sessionData?.session?.user?.id) {
          setUserId(sessionData.session.user.id);
          console.log("Using user ID from Supabase session:", sessionData.session.user.id);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };

    fetchUserId();
  }, [currentUser, isAuthenticated]);

  const getCampaign = useCallback((id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  }, [campaigns]);

  const addCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      console.log("Adding campaign with data:", campaignData);
      
      // Check if we have a userId from our state
      let effectiveUserId = userId;
      
      // If not, try to get it directly from AuthContext or Supabase
      if (!effectiveUserId) {
        if (currentUser) {
          console.log("Using AuthContext user:", currentUser.id);
          effectiveUserId = currentUser.id;
        } else {
          // Try getting the session directly
          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error("Session error:", sessionError);
              throw new Error("Authentication error: " + sessionError.message);
            }
            
            const session = sessionData?.session;
            effectiveUserId = session?.user?.id || null;
            
            if (!effectiveUserId) {
              console.error("No authenticated user found");
              throw new Error("You must be logged in to create a campaign");
            }
            
            console.log("Using user ID from Supabase session:", effectiveUserId);
          } catch (err) {
            console.error("Error fetching session:", err);
            throw new Error("Authentication error: Could not retrieve user session");
          }
        }
      }
      
      // Use authenticated user ID for both createdBy and user_id if not provided
      const campaignWithAuthUser = {
        ...campaignData,
        createdBy: campaignData.createdBy || effectiveUserId,
        user_id: effectiveUserId // This is crucial for Supabase RLS!
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
    updateCampaign: (id: string, updates: Partial<Omit<Campaign, 'id'>>) => {
      setLoading(true);
      updateCampaign(id, updates);
      setLoading(false);
      return Promise.resolve();
    },
    deleteCampaign: (id: string) => {
      setLoading(true);
      deleteCampaign(id);
      setLoading(false);
      return Promise.resolve();
    },
    loading,
    error
  };
}
