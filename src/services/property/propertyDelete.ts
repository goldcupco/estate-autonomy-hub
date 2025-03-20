
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
    
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Current user ID for property deletion:", user?.id || 'system');
    
    // First check if the property exists and belongs to this user
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id, user_id')
      .eq('id', propertyId)
      .single();
      
    if (fetchError) {
      console.error("Property not found or fetch error:", fetchError);
      toast.error("Delete failed: Property not found");
      return false;
    }
    
    if (!existingProperty) {
      console.error("Property not found");
      toast.error("Delete failed: Property not found");
      return false;
    }
    
    console.log("Property exists, belongs to user:", existingProperty.user_id);
    
    // Execute the delete operation
    const { error, status, statusText } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    // Log full response details
    console.log("Supabase response:", { error, status, statusText });
      
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      
      // Check if this is an RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error("This appears to be a Row Level Security (RLS) policy violation");
        toast.error("You don't have permission to delete this property");
      } else {
        toast.error(`Delete failed: ${error.message || error.details || 'Unknown error'}`);
      }
      
      return false;
    }
    
    // If we got here, the delete was successful
    console.log("Property deleted successfully from database");
    toast.success("Property deleted successfully");
    return true;
  } catch (error: any) {
    console.error('Error deleting property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to delete property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
