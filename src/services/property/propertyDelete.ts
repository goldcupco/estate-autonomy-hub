
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function deleteProperty(propertyId: string): Promise<boolean> {
  try {
    console.log(`Attempting to delete property with ID: ${propertyId}`);
    
    if (!propertyId || propertyId.trim() === '') {
      console.error("Invalid property ID for deletion");
      toast.error("Cannot delete: Invalid property ID");
      return false;
    }
    
    // First verify if the property exists (using a select query without RLS restriction)
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();
    
    if (fetchError || !existingProperty) {
      console.error("Property fetch error or property not found:", fetchError);
      toast.error(`Cannot delete: Property not found or not accessible`);
      return false;
    }
    
    // Execute the delete operation
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    // Log the delete response
    console.log("Delete response:", { error });
    
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      toast.error(`Delete failed: ${error.message || error.details || 'Unknown error'}`);
      return false;
    }
    
    // If we got here, the delete was successful
    console.log(`Property ${propertyId} deleted successfully from database`);
    toast.success("Property deleted successfully");
    return true;
  } catch (error: any) {
    console.error('Error deleting property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to delete property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
