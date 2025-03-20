
import { Campaign } from '@/models/Campaign';
import { Json } from '@/integrations/supabase/types';

// Helper function to ensure metrics are in the correct format
export const ensureMetricsFormat = (metrics: any): { contacts: number; responses: number; conversions: number; } => {
  const defaultMetrics = { contacts: 0, responses: 0, conversions: 0 };
  
  if (!metrics) return defaultMetrics;
  
  // If metrics is a string, try to parse it
  if (typeof metrics === 'string') {
    try {
      metrics = JSON.parse(metrics);
    } catch (e) {
      return defaultMetrics;
    }
  }
  
  // If metrics is not an object, return default
  if (typeof metrics !== 'object') return defaultMetrics;
  
  // Ensure all required properties exist
  return {
    contacts: Number(metrics.contacts || 0),
    responses: Number(metrics.responses || 0),
    conversions: Number(metrics.conversions || 0)
  };
};

// Helper function to map JSON array to string array
export const mapJsonArrayToStringArray = (jsonArray: Json[] | null): string[] => {
  if (!jsonArray) return [];
  
  return jsonArray.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return String(item);
    if (typeof item === 'boolean') return String(item);
    if (item === null) return '';
    
    // If it's an object or array, stringify it
    return JSON.stringify(item);
  });
};

// Map a database row to a Campaign model
export const mapDbRowToCampaign = (data: any): Campaign => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    status: data.status,
    type: data.type,
    leads: data.campaign_leads || [],
    startDate: data.start_date ? new Date(data.start_date).toISOString() : '',
    endDate: data.end_date ? new Date(data.end_date).toISOString() : '',
    createdBy: data.created_by,
    assignedUsers: mapJsonArrayToStringArray(data.assigned_users as Json[]),
    budget: Number(data.budget || 0),
    metrics: ensureMetricsFormat(data.metrics),
    accessRestricted: Boolean(data.access_restricted)
  };
};
