
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
    
    // Execute the delete operation with explicit debugging
    console.log("Executing Supabase delete query with params:", { propertyId });
    
    // First check if the property exists to ensure we're trying to delete a valid record
    const { data: existingProperty, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();
    
    if (checkError) {
      console.error("Error checking if property exists:", checkError);
      toast.error(`Delete failed: Property not found or access denied`);
      return false;
    }
    
    if (!existingProperty) {
      console.error("Property doesn't exist:", propertyId);
      toast.error("Cannot delete: Property doesn't exist");
      return false;
    }
    
    // Now attempt the actual deletion
    const { error } = await supabase
      .from('properties')
      .delete()
      .match({ id: propertyId });
    
    // Log detailed response for debugging
    console.log("Delete response:", { error });
    
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      toast.error(`Delete failed: ${error.message || error.details || 'Unknown error'}`);
      return false;
    }
    
    // Verify the deletion actually worked by checking if the property still exists
    const { data: verifyProperty, error: verifyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .maybeSingle();
    
    if (verifyError) {
      console.error("Error verifying deletion:", verifyError);
      // We'll assume it worked if we can't verify
    } else if (verifyProperty) {
      console.error("Property still exists after deletion attempt:", propertyId);
      toast.error("Delete failed: Property still exists in database");
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
