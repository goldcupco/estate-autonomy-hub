
import { Campaign } from '../models/Campaign';

export function useCampaignUsers(
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>,
  assignCampaignToUser: (userId: string, campaignId: string) => void,
  removeCampaignFromUser: (userId: string, campaignId: string) => void
) {
  const assignUserToCampaign = (campaignId: string, userId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId && !campaign.assignedUsers.includes(userId)) {
        return { ...campaign, assignedUsers: [...campaign.assignedUsers, userId] };
      }
      return campaign;
    }));
    
    assignCampaignToUser(userId, campaignId);
  };

  const removeUserFromCampaign = (campaignId: string, userId: string) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, assignedUsers: campaign.assignedUsers.filter(id => id !== userId) };
      }
      return campaign;
    }));
    
    removeCampaignFromUser(userId, campaignId);
  };

  const getUserCampaigns = (userId: string) => {
    return campaigns.filter(campaign => 
      campaign.createdBy === userId || campaign.assignedUsers.includes(userId)
    );
  };

  return {
    assignUserToCampaign,
    removeUserFromCampaign,
    getUserCampaigns
  };
}
