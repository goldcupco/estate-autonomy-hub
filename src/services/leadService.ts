
import { supabase } from '@/integrations/supabase/client';
import { Lead, Note } from '@/components/leads/types';
import { v4 as uuidv4 } from 'uuid';

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
        status: lead.status as Lead['status'],
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
    
    const { data, error } = await supabase
      .from('leads')
      .insert({
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
      })
      .select();
    
    if (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from insert');
    }
    
    return {
      id: data[0].id,
      name: `${data[0].first_name} ${data[0].last_name}`,
      email: data[0].email || '',
      phone: data[0].phone || '',
      status: data[0].status,
      source: data[0].lead_source || 'Unknown',
      dateAdded: new Date(data[0].created_at).toISOString().split('T')[0],
      lastContact: new Date(data[0].created_at).toISOString().split('T')[0],
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
    
    const { error } = await supabase
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
    
    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

// Add a note to a lead
export const addNote = async (leadId: string, note: Omit<Note, 'id'>): Promise<Note> => {
  try {
    // First, fetch the current lead to get the existing notes
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('notes')
      .eq('id', leadId)
      .single();
    
    if (leadError) {
      console.error('Error fetching lead notes:', leadError);
      throw leadError;
    }
    
    const newNote: Note = {
      ...note,
      id: uuidv4()
    };
    
    // Parse existing notes or create a new array
    const existingNotes: Note[] = leadData.notes ? JSON.parse(leadData.notes) : [];
    const updatedNotes = [...existingNotes, newNote];
    
    // Update the lead with the new notes
    const { error } = await supabase
      .from('leads')
      .update({
        notes: JSON.stringify(updatedNotes),
        last_contact_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);
    
    if (error) {
      console.error('Error adding note to lead:', error);
      throw error;
    }
    
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Delete a lead
export const deleteLead = async (leadId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);
    
    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
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
      return null;
    }
    
    if (data) {
      return {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email || '',
        phone: data.phone || '',
        status: data.status as Lead['status'],
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
