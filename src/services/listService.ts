import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface List {
  id: string;
  title: string;
  description: string;
  count: number;
  lastUpdated: string;
  type: 'seller' | 'buyer';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'seller' | 'buyer';
  contacts: number;
  responses: number;
  lastUpdated: string;
  status: string;
}

// Get all lists from database
export const getLists = async (): Promise<List[]> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*');
      
    if (error) {
      console.error('Error fetching lists:', error);
      toast({
        title: 'Error fetching lists',
        description: error.message,
        variant: 'destructive'
      });
      
      // Return mock data for now as a fallback
      return getMockLists();
    }
    
    // Format the data from database to match our List interface
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        title: item.name,
        description: item.description || '',
        // Use count property if it exists, otherwise default to 0
        count: typeof item.count !== 'undefined' ? item.count : 0,
        lastUpdated: new Date(item.updated_at).toISOString().split('T')[0],
        type: mapDatabaseTypeToListType(item.type)
      }));
    }
    
    // If no data, return mock data
    return getMockLists();
  } catch (err) {
    console.error('Error in getLists:', err);
    return getMockLists();
  }
};

// Helper function to ensure type is one of the allowed values
function mapDatabaseTypeToListType(type: string): 'seller' | 'buyer' {
  if (type === 'seller' || type === 'buyer') {
    return type;
  }
  
  // Default to 'buyer' if the type is not valid
  console.warn(`Invalid list type: ${type}, defaulting to 'buyer'`);
  return 'buyer';
}

// Get a single list by ID
export const getListById = async (id: string): Promise<List | null> => {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching list:', error);
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        title: data.name,
        description: data.description || '',
        // Use count property if it exists, otherwise default to 0
        count: typeof data.count !== 'undefined' ? data.count : 0,
        lastUpdated: new Date(data.updated_at).toISOString().split('T')[0],
        type: mapDatabaseTypeToListType(data.type)
      };
    }
    
    return null;
  } catch (err) {
    console.error('Error in getListById:', err);
    return null;
  }
};

// Create a new list
export const createList = async (list: Omit<List, 'id' | 'lastUpdated'>): Promise<List | null> => {
  try {
    const newList = {
      name: list.title,
      description: list.description,
      count: list.count,
      type: list.type,
      user_id: 'system', // In a real app, this would be the authenticated user's ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('lists')
      .insert(newList)
      .select();
      
    if (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error creating list',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
    
    if (data && data.length > 0) {
      return {
        id: data[0].id,
        title: data[0].name,
        description: data[0].description || '',
        // Use count property if it exists, otherwise default to 0
        count: typeof data[0].count !== 'undefined' ? data[0].count : 0,
        lastUpdated: new Date(data[0].updated_at).toISOString().split('T')[0],
        type: mapDatabaseTypeToListType(data[0].type)
      };
    }
    
    return null;
  } catch (err) {
    console.error('Error in createList:', err);
    return null;
  }
};

// Update an existing list
export const updateList = async (id: string, updates: Partial<Omit<List, 'id' | 'lastUpdated'>>): Promise<boolean> => {
  try {
    const listUpdates: any = {};
    
    if (updates.title) listUpdates.name = updates.title;
    if (updates.description) listUpdates.description = updates.description;
    if (updates.count !== undefined) listUpdates.count = updates.count;
    if (updates.type) listUpdates.type = updates.type;
    
    listUpdates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('lists')
      .update(listUpdates)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating list:', error);
      toast({
        title: 'Error updating list',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateList:', err);
    return false;
  }
};

// Delete a list
export const deleteList = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting list:', error);
      toast({
        title: 'Error deleting list',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteList:', err);
    return false;
  }
};

// Get campaigns from database
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*');
      
    if (error) {
      console.error('Error fetching campaigns:', error);
      return getMockCampaigns();
    }
    
    if (data && data.length > 0) {
      return data.map(item => {
        // Safely extract metrics values or default to 0
        const metrics = item.metrics || {};
        const contacts = typeof metrics === 'object' && metrics !== null ? (metrics.contacts || 0) : 0;
        const responses = typeof metrics === 'object' && metrics !== null ? (metrics.responses || 0) : 0;
        
        return {
          id: item.id,
          title: item.name,
          description: item.description || '',
          type: mapDatabaseTypeToListType(item.type),
          contacts: contacts,
          responses: responses,
          lastUpdated: new Date(item.updated_at).toISOString().split('T')[0],
          status: item.status
        };
      });
    }
    
    return getMockCampaigns();
  } catch (err) {
    console.error('Error in getCampaigns:', err);
    return getMockCampaigns();
  }
};

// Export a list to CSV
export const exportListToCsv = async (list: List): Promise<string> => {
  try {
    // This is a simplified version - in a real app, you would fetch the actual contacts
    // from the list_items table and generate CSV from that
    const headers = ['title', 'description', 'count', 'lastUpdated', 'type'];
    const csvContent = [
      headers.join(','),
      headers.map(header => `"${(list as any)[header]}"`).join(',')
    ].join('\n');
    
    return csvContent;
  } catch (err) {
    console.error('Error exporting list:', err);
    throw err;
  }
};

// Mock data functions for fallback
function getMockLists(): List[] {
  return [
    {
      id: "1",
      title: "All Sellers",
      description: "Complete list of property sellers",
      count: 342,
      lastUpdated: "2023-06-12",
      type: "seller"
    },
    {
      id: "2",
      title: "All Buyers",
      description: "Complete list of property buyers",
      count: 278,
      lastUpdated: "2023-06-10",
      type: "buyer"
    },
    {
      id: "3",
      title: "High Value Sellers",
      description: "Sellers with properties > $500k",
      count: 124,
      lastUpdated: "2023-06-08",
      type: "seller"
    },
    {
      id: "4",
      title: "Cash Buyers",
      description: "Buyers ready to purchase with cash",
      count: 86,
      lastUpdated: "2023-06-05",
      type: "buyer"
    },
    {
      id: "5",
      title: "Motivated Sellers",
      description: "Sellers needing to move quickly",
      count: 53,
      lastUpdated: "2023-06-07",
      type: "seller"
    },
    {
      id: "6",
      title: "First-Time Buyers",
      description: "Buyers looking for their first home",
      count: 112,
      lastUpdated: "2023-06-09",
      type: "buyer"
    },
  ];
}

function getMockCampaigns(): Campaign[] {
  return [
    {
      id: "1",
      title: "Spring Sellers",
      description: "Campaign targeting spring sellers",
      type: "seller",
      contacts: 342,
      responses: 87,
      lastUpdated: "2023-06-12",
      status: "active"
    },
    {
      id: "2",
      title: "First-Time Buyers",
      description: "Campaign for first-time home buyers",
      type: "buyer",
      contacts: 178,
      responses: 63,
      lastUpdated: "2023-06-10",
      status: "active"
    },
    {
      id: "3",
      title: "Expired Listings",
      description: "Follow-up with expired listings",
      type: "seller",
      contacts: 98,
      responses: 29,
      lastUpdated: "2023-06-05",
      status: "paused"
    },
    {
      id: "4",
      title: "Investment Properties",
      description: "Campaign for investment property buyers",
      type: "buyer",
      contacts: 124,
      responses: 41,
      lastUpdated: "2023-06-08",
      status: "active"
    },
  ];
}
