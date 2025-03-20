
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
    
    // First, let's check if this is a system property
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', propertyId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching property before delete:", fetchError);
      toast.error(`Cannot delete: ${fetchError.message}`);
      return false;
    }
    
    console.log("Property belongs to user_id:", property?.user_id);
    
    // For system properties, we need to use a special approach
    if (property?.user_id === 'system') {
      console.log("This is a system property, using admin API");
      
      // Use the rpc function to bypass RLS for system properties
      const { error } = await supabase.rpc('admin_delete_property', {
        property_id: propertyId
      });
      
      if (error) {
        console.error("Admin delete error:", error);
        toast.error(`Delete failed: ${error.message}`);
        return false;
      }
      
      console.log(`System property ${propertyId} deleted successfully`);
      toast.success("Property deleted successfully");
      return true;
    } else {
      // Standard delete for user-owned properties
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        console.error("Delete error:", error);
        toast.error(`Delete failed: ${error.message}`);
        return false;
      }
      
      console.log(`Property ${propertyId} deleted successfully`);
      toast.success("Property deleted successfully");
      return true;
    }
  } catch (error: any) {
    console.error('Error deleting property:', error);
    toast.error(`Failed to delete property: ${error.message}`);
    return false;
  }
}
