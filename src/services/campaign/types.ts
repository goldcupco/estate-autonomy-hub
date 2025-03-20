
import { Campaign } from '@/models/Campaign';

// Define any campaign-specific types and interfaces here
export type CampaignData = {
  name: string;
  description?: string;
  status: Campaign['status'];
  type: Campaign['type'];
  start_date: string;
  end_date?: string;
  created_by: string;
  assigned_users: string[];
  budget?: number;
  metrics?: {
    contacts: number;
    responses: number;
    conversions: number;
  };
  access_restricted?: boolean;
  user_id?: string;
};

// Helper function to ensure metrics has the right format
export function ensureMetricsFormat(metrics: any): Campaign['metrics'] {
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
export function mapDatabaseStatusToCampaignStatus(status: string): Campaign['status'] {
  const validStatuses: Campaign['status'][] = ['draft', 'active', 'paused', 'completed'];
  
  if (validStatuses.includes(status as Campaign['status'])) {
    return status as Campaign['status'];
  }
  
  // Default to 'draft' if the status is not valid
  console.warn(`Invalid campaign status: ${status}, defaulting to 'draft'`);
  return 'draft';
}

// Helper function to ensure type is one of the allowed values
export function mapDatabaseTypeToCampaignType(type: string): Campaign['type'] {
  const validTypes: Campaign['type'][] = ['seller', 'buyer', 'both'];
  
  if (validTypes.includes(type as Campaign['type'])) {
    return type as Campaign['type'];
  }
  
  // Default to 'both' if the type is not valid
  console.warn(`Invalid campaign type: ${type}, defaulting to 'both'`);
  return 'both';
}

// Helper to convert DB row to Campaign object
export function mapDbRowToCampaign(campaign: any): Campaign {
  return {
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
      ? campaign.assigned_users.map((user: any) => String(user)) 
      : [],
    budget: campaign.budget,
    metrics: ensureMetricsFormat(campaign.metrics),
    accessRestricted: campaign.access_restricted || false
  };
}
