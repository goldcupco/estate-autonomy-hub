
import { supabase } from '@/integrations/supabase/client';
import { Lead, Note } from '@/components/leads/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Fetch all leads from the database
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      return data.map(lead => ({
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email || '',
        phone: lead.phone || '',
        status: mapDatabaseStatusToLeadStatus(lead.status),
        source: lead.lead_source || 'Unknown',
        dateAdded: new Date(lead.created_at).toISOString().split('T')[0],
        lastContact: lead.last_contact_date 
          ? new Date(lead.last_contact_date).toISOString().split('T')[0] 
          : new Date(lead.created_at).toISOString().split('T')[0],
        notes: lead.notes ? JSON.parse(lead.notes) : [],
        flaggedForNextStage: false,
        readyToMove: false,
        doNotContact: false
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Helper function to ensure status is one of the allowed values
function mapDatabaseStatusToLeadStatus(status: string): Lead['status'] {
  const validStatuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  
  if (validStatuses.includes(status as Lead['status'])) {
    return status as Lead['status'];
  }
  
  // Default to 'New' if the status is not valid
  console.warn(`Invalid lead status: ${status}, defaulting to 'New'`);
  return 'New';
}

// Add a new lead to the database
export const addLead = async (lead: Omit<Lead, 'id' | 'dateAdded' | 'lastContact' | 'notes' | 'flaggedForNextStage' | 'readyToMove' | 'doNotContact'>): Promise<Lead> => {
  try {
    const [firstName, ...lastNameParts] = lead.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const initialNote: Note = {
      id: uuidv4(),
      text: `Lead created with status: ${lead.status}`,
      type: 'stage_change',
      timestamp: new Date().toISOString(),
      metadata: {
        newStage: lead.status
      }
    };
    
    // Format the data for the database
    const leadData = {
      first_name: firstName,
      last_name: lastName || '',
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      lead_type: 'buyer',
      lead_source: lead.source,
      user_id: 'system',
      notes: JSON.stringify([initialNote]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log("Creating new lead:", leadData);
    
    // Use the admin RPC function to bypass RLS for system leads
    const { data, error } = await supabase.rpc('admin_create_lead', {
      lead_data: leadData
    });
    
    if (error) {
      console.error('Error adding lead:', error);
      toast({
        title: 'Error adding lead',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    if (!data) {
      const errorMsg = 'No data returned from insert';
      toast({
        title: 'Error adding lead',
        description: errorMsg,
        variant: 'destructive'
      });
      throw new Error(errorMsg);
    }
    
    toast({
      title: 'Lead added successfully',
      description: `${lead.name} has been added as a new lead`,
    });
    
    return {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email || '',
      phone: data.phone || '',
      status: mapDatabaseStatusToLeadStatus(data.status),
      source: data.lead_source || 'Unknown',
      dateAdded: new Date(data.created_at).toISOString().split('T')[0],
      lastContact: new Date(data.created_at).toISOString().split('T')[0],
      notes: [initialNote],
      flaggedForNextStage: false,
      readyToMove: false,
      doNotContact: false
    };
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

// Update an existing lead
export const updateLead = async (lead: Lead): Promise<void> => {
  try {
    const [firstName, ...lastNameParts] = lead.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    // First, let's check if this is a system lead
    const { data: leadCheck, error: fetchError } = await supabase
      .from('leads')
      .select('user_id')
      .eq('id', lead.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching lead before update:", fetchError);
      toast({
        title: 'Error updating lead',
        description: fetchError.message,
        variant: 'destructive'
      });
      throw fetchError;
    }
    
    console.log("Lead belongs to user_id:", leadCheck?.user_id);
    
    let error;
    
    // For system leads, we need to use the admin RPC function
    if (leadCheck?.user_id === 'system') {
      console.log("This is a system lead, using admin API");
      
      const leadData = {
        first_name: firstName,
        last_name: lastName || '',
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        lead_source: lead.source,
        notes: JSON.stringify(lead.notes || []),
        updated_at: new Date().toISOString()
      };
      
      const { error: rpcError } = await supabase.rpc('admin_update_lead', {
        lead_id: lead.id,
        lead_data: leadData
      });
      
      error = rpcError;
    } else {
      // Standard update for user-owned leads
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          lead_source: lead.source,
          notes: JSON.stringify(lead.notes || []),
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
      
      error = updateError;
    }
    
    if (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error updating lead',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    toast({
      title: 'Lead updated',
      description: `${lead.name}'s information has been updated`,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

// Add a note to a lead
export const addNote = async (leadId: string, note: Omit<Note, 'id'>): Promise<Note> => {
  try {
    // First, fetch the current lead to get the existing notes and check if it's a system lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('notes, user_id')
      .eq('id', leadId)
      .single();
    
    if (leadError) {
      console.error('Error fetching lead notes:', leadError);
      toast({
        title: 'Error adding note',
        description: leadError.message,
        variant: 'destructive'
      });
      throw leadError;
    }
    
    const newNote: Note = {
      ...note,
      id: uuidv4()
    };
    
    // Parse existing notes or create a new array
    const existingNotes: Note[] = leadData.notes ? JSON.parse(leadData.notes) : [];
    const updatedNotes = [...existingNotes, newNote];
    
    const noteUpdateData = {
      notes: JSON.stringify(updatedNotes),
      last_contact_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    let error;
    
    // For system leads, we need to use the admin RPC function
    if (leadData.user_id === 'system') {
      console.log("This is a system lead, using admin API for adding note");
      
      const { error: rpcError } = await supabase.rpc('admin_update_lead', {
        lead_id: leadId,
        lead_data: noteUpdateData
      });
      
      error = rpcError;
    } else {
      // Standard update for user-owned leads
      const { error: updateError } = await supabase
        .from('leads')
        .update(noteUpdateData)
        .eq('id', leadId);
      
      error = updateError;
    }
    
    if (error) {
      console.error('Error adding note to lead:', error);
      toast({
        title: 'Error adding note',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    toast({
      title: 'Note added',
      description: 'Your note has been saved successfully',
    });
    
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Delete a lead
export const deleteLead = async (leadId: string): Promise<void> => {
  try {
    // First, let's check if this is a system lead
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('user_id')
      .eq('id', leadId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching lead before delete:", fetchError);
      toast({
        title: 'Error deleting lead',
        description: fetchError.message,
        variant: 'destructive'
      });
      throw fetchError;
    }
    
    console.log("Lead belongs to user_id:", lead?.user_id);
    
    let error;
    
    // For system leads, we need to use the admin RPC function
    if (lead?.user_id === 'system') {
      console.log("This is a system lead, using admin API");
      
      const { error: rpcError } = await supabase.rpc('admin_delete_lead', {
        lead_id: leadId
      });
      
      error = rpcError;
    } else {
      // Standard delete for user-owned leads
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);
      
      error = deleteError;
    }
    
    if (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
    
    toast({
      title: 'Lead deleted',
      description: 'The lead has been permanently removed',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

// Get a single lead by ID
export const getLeadById = async (leadId: string): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();
    
    if (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: 'Error fetching lead',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email || '',
        phone: data.phone || '',
        status: mapDatabaseStatusToLeadStatus(data.status),
        source: data.lead_source || 'Unknown',
        dateAdded: new Date(data.created_at).toISOString().split('T')[0],
        lastContact: data.last_contact_date 
          ? new Date(data.last_contact_date).toISOString().split('T')[0] 
          : new Date(data.created_at).toISOString().split('T')[0],
        notes: data.notes ? JSON.parse(data.notes) : [],
        flaggedForNextStage: false,
        readyToMove: false,
        doNotContact: false
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching lead by ID:', error);
    return null;
  }
};
