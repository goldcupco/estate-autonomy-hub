
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Campaign, mockCampaigns } from '../models/Campaign';
import { useAuth } from './AuthContext';
import { 
  fetchCampaigns, 
  createCampaign as createCampaignService, 
  updateCampaign as updateCampaignService,
  deleteCampaign as deleteCampaignService,
  addLeadToCampaign as addLeadToCampaignService,
  removeLeadFromCampaign as removeLeadFromCampaignService
} from '../services/campaignService';

interface CampaignContextType {
  campaigns: Campaign[];
  getCampaign: (id: string) => Campaign | undefined;
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<string>;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, 'id'>>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  addLeadToCampaign: (campaignId: string, leadId: string) => Promise<void>;
  removeLeadFromCampaign: (campaignId: string, leadId: string) => Promise<void>;
  assignUserToCampaign: (campaignId: string, userId: string) => void;
  removeUserFromCampaign: (campaignId: string, userId: string) => void;
  accessibleCampaigns: Campaign[];
  getUserCampaigns: (userId: string) => Campaign[];
  refreshCampaigns: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAdmin, assignCampaignToUser, removeCampaignFromUser } = useAuth();
  
  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCampaigns = await fetchCampaigns();
      setCampaigns(fetchedCampaigns.length > 0 ? fetchedCampaigns : mockCampaigns);
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err);
      setError(err.message || "Failed to load campaigns");
      // Fall back to mock data if API fails
      setCampaigns(mockCampaigns);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCampaigns();
  }, []);
  
  const refreshCampaigns = async () => {
    await loadCampaigns();
  };
  
  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };
  
  const addCampaign = async (campaignData: Omit<Campaign, 'id'>): Promise<string> => {
    setLoading(true);
    try {
      const newCampaign = await createCampaignService(campaignData);
      if (newCampaign) {
        setCampaigns(prev => [...prev, newCampaign]);
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
  
  const addLeadToCampaign = async (campaignId: string, leadId: string) => {
    setLoading(true);
    try {
      const success = await addLeadToCampaignService(campaignId, leadId);
      if (success) {
        setCampaigns(campaigns.map(campaign => {
          if (campaign.id === campaignId && !campaign.leads.includes(leadId)) {
            return { ...campaign, leads: [...campaign.leads, leadId] };
          }
          return campaign;
        }));
      } else {
        throw new Error("Failed to add lead to campaign");
      }
    } catch (err: any) {
      console.error("Error in addLeadToCampaign:", err);
      setError(err.message || "Failed to add lead to campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const removeLeadFromCampaign = async (campaignId: string, leadId: string) => {
    setLoading(true);
    try {
      const success = await removeLeadFromCampaignService(campaignId, leadId);
      if (success) {
        setCampaigns(campaigns.map(campaign => {
          if (campaign.id === campaignId) {
            return { ...campaign, leads: campaign.leads.filter(id => id !== leadId) };
          }
          return campaign;
        }));
      } else {
        throw new Error("Failed to remove lead from campaign");
      }
    } catch (err: any) {
      console.error("Error in removeLeadFromCampaign:", err);
      setError(err.message || "Failed to remove lead from campaign");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const assignUserToCampaign = (campaignId: string, userId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId && !campaign.assignedUsers.includes(userId)) {
        return { ...campaign, assignedUsers: [...campaign.assignedUsers, userId] };
      }
      return campaign;
    }));
    
    // Also update the user's campaigns list
    assignCampaignToUser(userId, campaignId);
  };
  
  const removeUserFromCampaign = (campaignId: string, userId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, assignedUsers: campaign.assignedUsers.filter(id => id !== userId) };
      }
      return campaign;
    }));
    
    // Also update the user's campaigns list
    removeCampaignFromUser(userId, campaignId);
  };
  
  const getUserCampaigns = (userId: string) => {
    return campaigns.filter(campaign => 
      campaign.createdBy === userId || campaign.assignedUsers.includes(userId)
    );
  };
  
  const accessibleCampaigns = isAdmin 
    ? campaigns 
    : currentUser 
      ? campaigns.filter(campaign => 
          campaign.createdBy === currentUser.id || 
          campaign.assignedUsers.includes(currentUser.id)
        )
      : [];
  
  return (
    <CampaignContext.Provider value={{
      campaigns,
      getCampaign,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      addLeadToCampaign,
      removeLeadFromCampaign,
      assignUserToCampaign,
      removeUserFromCampaign,
      accessibleCampaigns,
      getUserCampaigns,
      refreshCampaigns,
      loading,
      error
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};
