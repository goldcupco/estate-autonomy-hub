
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError);
      toast.error("Delete failed: Authentication error");
      return false;
    }
    
    // Use the actual user ID from authentication
    const userId = user?.id;
    console.log("Current authenticated user ID for property deletion:", userId);
    
    if (!userId) {
      console.error("No authenticated user found");
      toast.error("Delete failed: You must be logged in");
      return false;
    }
    
    // First check if the property exists and belongs to this user
    console.log(`Checking if property ${propertyId} exists and belongs to user ${userId}`);
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id, user_id')
      .eq('id', propertyId)
      .single();
      
    if (fetchError) {
      console.error("Property not found or fetch error:", fetchError);
      toast.error(`Delete failed: ${fetchError.message || "Property not found"}`);
      return false;
    }
    
    if (!existingProperty) {
      console.error("Property not found");
      toast.error("Delete failed: Property not found");
      return false;
    }
    
    console.log("Property exists, belongs to user:", existingProperty.user_id);
    console.log("Current authenticated user:", userId);
    
    // Execute the delete operation
    const { error, count } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .select('count');
    
    // Log full response details
    console.log("Supabase delete response count:", count);
      
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
