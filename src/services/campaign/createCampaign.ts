
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';
import { ensureMetricsFormat, mapDbRowToCampaign } from './types';

// Create a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign | null> => {
  try {
    console.log("Creating new campaign with data:", campaign);
    
    // First check that we have a user_id provided from the hook
    let effectiveUserId = campaign.user_id;
    
    if (!effectiveUserId) {
      console.log('No user_id provided in campaign data, fetching from session');
      
      // As a fallback, try to get the current authenticated user
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Authentication session error:', authError);
        toast.error('Authentication error: ' + authError.message);
        return null;
      }
      
      effectiveUserId = authData?.session?.user?.id;
      
      if (!effectiveUserId) {
        // If we're in development mode and no authenticated user, use a mock ID
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Using mock user ID "system"');
          effectiveUserId = 'system';
        } else {
          console.error('No authenticated user session found');
          toast.error('You must be logged in to create a campaign');
          return null;
        }
      } else {
        console.log('Using authenticated user ID from session:', effectiveUserId);
      }
    }
    
    // Format the campaign data for the database
    const campaignData = {
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.startDate || null,
      end_date: campaign.endDate || null,
      created_by: campaign.createdBy || effectiveUserId,
      assigned_users: campaign.assignedUsers || [],
      budget: campaign.budget || 0,
      metrics: ensureMetricsFormat(campaign.metrics),
      access_restricted: campaign.accessRestricted || false,
      user_id: effectiveUserId // Critical for RLS
    };
    
    console.log("Formatted campaign data for insert:", campaignData);
    
    // First check if a similar campaign already exists to avoid duplicates
    const { data: existingCampaigns, error: checkError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('name', campaignData.name)
      .eq('user_id', campaignData.user_id);
    
    if (checkError) {
      console.error('Error checking for existing campaigns:', checkError);
      toast.error('Error checking for existing campaigns: ' + checkError.message);
      return null;
    }
    
    if (existingCampaigns && existingCampaigns.length > 0) {
      console.log("Campaign with this name already exists:", existingCampaigns);
      toast.error(`A campaign with the name "${campaignData.name}" already exists`);
      return null;
    }
    
    // Create the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating campaign:', error);
      
      // Enhanced error message based on error code
      if (error.code === '42501') {
        toast.error('Permission denied: You do not have access to create campaigns');
        console.log('RLS policy issue - attempting to refresh session...');
        
        // Force refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          toast.error('Authentication error: Please log in again');
        } else {
          console.log('Session refreshed, please try again');
          toast.error('Authentication refreshed, please try again');
        }
      } else if (error.code === '23505') {
        toast.error('A campaign with this name already exists');
      } else if (error.code === '401' || error.code.toString() === '401') {
        console.log('Authentication error - attempting to refresh session');
        
        // Force refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          toast.error('Authentication error: Please log in again');
        } else {
          toast.error('Authentication refreshed, please try again');
        }
      } else {
        toast.error(`Failed to create campaign: ${error.message}`);
      }
      
      return null;
    }
    
    if (!data) {
      toast.error('Failed to create campaign: No data returned');
      return null;
    }
    
    toast.success('Campaign created successfully');
    console.log("Campaign created successfully:", data);
    return mapDbRowToCampaign(data);
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    toast.error(`Failed to create campaign: ${error.message}`);
    return null;
  }
};
