
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
    
    // Try to get the auth user ID to debug RLS issues
    const { data: authData } = await supabase.auth.getUser();
    console.log("Current auth user:", authData?.user?.id || "No authenticated user");
    
    // System properties may use "system" as user_id
    console.log("Attempting direct property deletion:");
    console.log("- Current timestamp:", new Date().toISOString());
    console.log("- Property ID:", propertyId);
    
    // Explicit system property handling
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    console.log("Delete response:", error ? error : "Success (no error)");
    
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      
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
