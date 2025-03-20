
import { supabase } from '@/integrations/supabase/client';
import { Campaign } from '@/models/Campaign';
import { toast } from 'sonner';

// Fetch all campaigns from the database
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      toast.error(`Error fetching campaigns: ${error.message}`);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description || '',
        status: mapDatabaseStatusToCampaignStatus(campaign.status),
        type: mapDatabaseTypeToCampaignType(campaign.type),
        leads: [], // We'll fetch leads separately if needed
        startDate: new Date(campaign.start_date).toISOString().split('T')[0],
        endDate: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : undefined,
        createdBy: campaign.created_by,
        assignedUsers: Array.isArray(campaign.assigned_users) 
          ? campaign.assigned_users.map(user => String(user)) 
          : [],
        budget: campaign.budget,
        metrics: campaign.metrics 
          ? ensureMetricsFormat(campaign.metrics) 
          : {
              contacts: 0,
              responses: 0,
              conversions: 0
            },
        accessRestricted: campaign.access_restricted || false
      }));
    }
    
    return [];
  } catch (error: any) {
    console.error('Error in fetchCampaigns:', error);
    toast.error(`Failed to fetch campaigns: ${error.message}`);
    return [];
  }
};

// Helper function to ensure metrics has the right format
function ensureMetricsFormat(metrics: any): Campaign['metrics'] {
  if (typeof metrics !== 'object' || metrics === null) {
    return { contacts: 0, responses: 0, conversions: 0 };
  }
  
  return {
    contacts: typeof metrics.contacts === 'number' ? metrics.contacts : 0,
    responses: typeof metrics.responses === 'number' ? metrics.responses : 0,
    conversions: typeof metrics.conversions === 'number' ? metrics.conversions : 0
  };
}

// Helper function to ensure status is one of the allowed values
function mapDatabaseStatusToCampaignStatus(status: string): Campaign['status'] {
  const validStatuses: Campaign['status'][] = ['draft', 'active', 'paused', 'completed'];
  
  if (validStatuses.includes(status as Campaign['status'])) {
    return status as Campaign['status'];
  }
  
  // Default to 'draft' if the status is not valid
  console.warn(`Invalid campaign status: ${status}, defaulting to 'draft'`);
  return 'draft';
}

// Helper function to ensure type is one of the allowed values
function mapDatabaseTypeToCampaignType(type: string): Campaign['type'] {
  const validTypes: Campaign['type'][] = ['seller', 'buyer', 'both'];
  
  if (validTypes.includes(type as Campaign['type'])) {
    return type as Campaign['type'];
  }
  
  // Default to 'both' if the type is not valid
  console.warn(`Invalid campaign type: ${type}, defaulting to 'both'`);
  return 'both';
}

// Add a new campaign
export const createCampaign = async (campaign: Omit<Campaign, 'id'>): Promise<Campaign | null> => {
  try {
    // Format the data for the database
    const campaignData = {
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      type: campaign.type,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      created_by: campaign.createdBy,
      assigned_users: campaign.assignedUsers,
      budget: campaign.budget,
      metrics: campaign.metrics || {
        contacts: 0,
        responses: 0,
        conversions: 0
      },
      access_restricted: campaign.accessRestricted,
      user_id: 'system'
    };
    
    console.log("Creating new campaign:", campaignData);
    
    // Use the admin RPC function to create a campaign
    const { data, error } = await supabase.rpc('admin_create_campaign', {
      campaign_data: campaignData
    });
    
    if (error) {
      console.error('Error creating campaign:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
      return null;
    }
    
    if (!data) {
      console.error('No data returned from campaign creation');
      toast.error('Failed to create campaign: No data returned');
      return null;
    }
    
    // Cast the data to the correct type and parse it
    const campaignRecord = data as any;
    
    toast.success('Campaign created successfully');
    
    return {
      id: campaignRecord.id,
      name: campaignRecord.name,
      description: campaignRecord.description || '',
      status: mapDatabaseStatusToCampaignStatus(campaignRecord.status),
      type: mapDatabaseTypeToCampaignType(campaignRecord.type),
      leads: [], // We'll fetch leads separately if needed
      startDate: new Date(campaignRecord.start_date).toISOString().split('T')[0],
      endDate: campaignRecord.end_date ? new Date(campaignRecord.end_date).toISOString().split('T')[0] : undefined,
      createdBy: campaignRecord.created_by,
      // Convert all assigned users to strings to match our Campaign type
      assignedUsers: Array.isArray(campaignRecord.assigned_users) 
        ? campaignRecord.assigned_users.map((user: any) => String(user)) 
        : [],
      budget: campaignRecord.budget,
      metrics: ensureMetricsFormat(campaignRecord.metrics),
      accessRestricted: campaignRecord.access_restricted || false
    };
  } catch (error: any) {
    console.error('Error in createCampaign:', error);
    toast.error(`Failed to create campaign: ${error.message}`);
    return null;
  }
};

// Update an existing campaign
export const updateCampaign = async (id: string, updates: Partial<Omit<Campaign, 'id'>>): Promise<boolean> => {
  try {
    // Format the data for the database
    const campaignData: any = {};
    
    if (updates.name) campaignData.name = updates.name;
    if (updates.description !== undefined) campaignData.description = updates.description;
    if (updates.status) campaignData.status = updates.status;
    if (updates.type) campaignData.type = updates.type;
    if (updates.startDate) campaignData.start_date = updates.startDate;
    if (updates.endDate) campaignData.end_date = updates.endDate;
    if (updates.createdBy) campaignData.created_by = updates.createdBy;
    if (updates.assignedUsers) campaignData.assigned_users = updates.assignedUsers;
    if (updates.budget !== undefined) campaignData.budget = updates.budget;
    if (updates.metrics) campaignData.metrics = updates.metrics;
    if (updates.accessRestricted !== undefined) campaignData.access_restricted = updates.accessRestricted;
    
    console.log("Updating campaign with ID:", id, "Data:", campaignData);
    
    // Use the admin RPC function to update a campaign
    const { error } = await supabase.rpc('admin_update_campaign', {
      campaign_id: id,
      campaign_data: campaignData
    });
    
    if (error) {
      console.error('Error updating campaign:', error);
      toast.error(`Failed to update campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Campaign updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error in updateCampaign:', error);
    toast.error(`Failed to update campaign: ${error.message}`);
    return false;
  }
};

// Delete a campaign
export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    console.log("Deleting campaign with ID:", id);
    
    // Use the admin RPC function to delete a campaign
    const { error } = await supabase.rpc('admin_delete_campaign', {
      campaign_id: id
    });
    
    if (error) {
      console.error('Error deleting campaign:', error);
      toast.error(`Failed to delete campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Campaign deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteCampaign:', error);
    toast.error(`Failed to delete campaign: ${error.message}`);
    return false;
  }
};

// Get a single campaign by ID
export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        status: mapDatabaseStatusToCampaignStatus(data.status),
        type: mapDatabaseTypeToCampaignType(data.type),
        leads: [], // We'll fetch leads separately if needed
        startDate: new Date(data.start_date).toISOString().split('T')[0],
        endDate: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : undefined,
        createdBy: data.created_by,
        assignedUsers: Array.isArray(data.assigned_users) 
          ? data.assigned_users.map(user => String(user)) 
          : [],
        budget: data.budget,
        metrics: ensureMetricsFormat(data.metrics),
        accessRestricted: data.access_restricted || false
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error in getCampaignById:', error);
    return null;
  }
};

// Add a lead to a campaign
export const addLeadToCampaign = async (campaignId: string, leadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('campaign_leads')
      .insert({
        campaign_id: campaignId,
        lead_id: leadId
      });
    
    if (error) {
      console.error('Error adding lead to campaign:', error);
      toast.error(`Failed to add lead to campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Lead added to campaign successfully');
    return true;
  } catch (error: any) {
    console.error('Error in addLeadToCampaign:', error);
    toast.error(`Failed to add lead to campaign: ${error.message}`);
    return false;
  }
};

// Remove a lead from a campaign
export const removeLeadFromCampaign = async (campaignId: string, leadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('campaign_leads')
      .delete()
      .match({
        campaign_id: campaignId,
        lead_id: leadId
      });
    
    if (error) {
      console.error('Error removing lead from campaign:', error);
      toast.error(`Failed to remove lead from campaign: ${error.message}`);
      return false;
    }
    
    toast.success('Lead removed from campaign successfully');
    return true;
  } catch (error: any) {
    console.error('Error in removeLeadFromCampaign:', error);
    toast.error(`Failed to remove lead from campaign: ${error.message}`);
    return false;
  }
};
