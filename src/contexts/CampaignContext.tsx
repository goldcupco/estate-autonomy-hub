import React, { createContext, useContext, useState } from 'react';
import { Campaign, mockCampaigns } from '../models/Campaign';
import { useAuth } from './AuthContext';

interface CampaignContextType {
  campaigns: Campaign[];
  getCampaign: (id: string) => Campaign | undefined;
  addCampaign: (campaign: Omit<Campaign, 'id'>) => string;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, 'id'>>) => void;
  deleteCampaign: (id: string) => void;
  addLeadToCampaign: (campaignId: string, leadId: string) => void;
  removeLeadFromCampaign: (campaignId: string, leadId: string) => void;
  assignUserToCampaign: (campaignId: string, userId: string) => void;
  removeUserFromCampaign: (campaignId: string, userId: string) => void;
  accessibleCampaigns: Campaign[];
  getUserCampaigns: (userId: string) => Campaign[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const { currentUser, isAdmin, assignCampaignToUser, removeCampaignFromUser } = useAuth();
  
  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };
  
  const addCampaign = (campaignData: Omit<Campaign, 'id'>) => {
    const id = String(campaigns.length + 1);
    const newCampaign = { ...campaignData, id };
    setCampaigns([...campaigns, newCampaign]);
    return id;
  };
  
  const updateCampaign = (id: string, updates: Partial<Omit<Campaign, 'id'>>) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
  };
  
  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
  };
  
  const addLeadToCampaign = (campaignId: string, leadId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId && !campaign.leads.includes(leadId)) {
        return { ...campaign, leads: [...campaign.leads, leadId] };
      }
      return campaign;
    }));
  };
  
  const removeLeadFromCampaign = (campaignId: string, leadId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, leads: campaign.leads.filter(id => id !== leadId) };
      }
      return campaign;
    }));
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
      getUserCampaigns
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
