
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
    
    // Execute the delete operation
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
      
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      toast.error(`Delete failed: ${error.message}`);
      return false;
    }
    
    // If we got here, the delete was successful
    console.log("Property deleted successfully from database");
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    toast.error("Failed to delete property");
    return false;
  }
}
