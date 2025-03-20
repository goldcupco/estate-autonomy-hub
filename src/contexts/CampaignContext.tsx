
import React, { createContext, useContext } from 'react';
import { Campaign, mockCampaigns } from '../models/Campaign';
import { useAuth } from './AuthContext';
import { useCampaignLoader } from '@/hooks/useCampaignLoader';
import { useCampaignOperations } from '@/hooks/useCampaignOperations';
import { useCampaignLeads } from '@/hooks/useCampaignLeads';
import { useCampaignUsers } from '@/hooks/useCampaignUsers';

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
  const { currentUser, isAdmin, assignCampaignToUser, removeCampaignFromUser } = useAuth();
  
  // Load campaigns
  const { 
    campaigns, 
    setCampaigns, 
    loading: loadingCampaigns, 
    error: campaignsError, 
    refreshCampaigns 
  } = useCampaignLoader();
  
  // Set up campaign operations
  const { 
    getCampaign, 
    addCampaign, 
    updateCampaign, 
    deleteCampaign, 
    loading: operationsLoading, 
    error: operationsError 
  } = useCampaignOperations(campaigns, setCampaigns, refreshCampaigns);
  
  // Set up lead operations
  const { 
    addLeadToCampaign, 
    removeLeadFromCampaign, 
    loading: leadsLoading, 
    error: leadsError 
  } = useCampaignLeads(campaigns, setCampaigns);
  
  // Set up user assignments
  const { 
    assignUserToCampaign, 
    removeUserFromCampaign, 
    getUserCampaigns 
  } = useCampaignUsers(campaigns, setCampaigns, assignCampaignToUser, removeCampaignFromUser);
  
  // Calculate loading and error states
  const loading = loadingCampaigns || operationsLoading || leadsLoading;
  const error = campaignsError || operationsError || leadsError;
  
  // Calculate accessible campaigns based on user role
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
      refreshCampaigns: async () => { await refreshCampaigns(); },
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
