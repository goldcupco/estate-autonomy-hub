
import { useState } from 'react';
import { Campaign } from '../models/Campaign';
import { 
  addLeadToCampaign as addLeadToCampaignService,
  removeLeadFromCampaign as removeLeadFromCampaignService
} from '../services/campaign';

export function useCampaignLeads(
  campaigns: Campaign[], 
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    addLeadToCampaign,
    removeLeadFromCampaign,
    loading,
    error
  };
}
