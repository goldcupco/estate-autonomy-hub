
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
    
    // Check authentication state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Authentication session check:", session ? "Session exists" : "No session");
    
    // Execute the delete operation directly
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
    
    // Check for errors during deletion
    if (error) {
      console.error("Supabase delete error:", error);
      
      // Check if this is an RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error("This appears to be a Row Level Security (RLS) policy violation");
        toast.error("You don't have permission to delete this property. Please log in or try a different property.");
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
