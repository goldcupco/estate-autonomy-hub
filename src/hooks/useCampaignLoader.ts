
import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '../models/Campaign';
import { fetchCampaigns } from '../services/campaign';

export function useCampaignLoader() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCampaigns = await fetchCampaigns();
      console.log("Fetched campaigns:", fetchedCampaigns);
      setCampaigns(fetchedCampaigns);
      return fetchedCampaigns;
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err);
      setError(err.message || "Failed to load campaigns");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return {
    campaigns,
    setCampaigns,
    loading,
    error,
    refreshCampaigns: loadCampaigns
  };
}
