
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export async function updateProperty(updatedProperty: Property): Promise<boolean> {
  try {
    console.log("Updating property with data:", updatedProperty);
    
    if (!updatedProperty || !updatedProperty.id) {
      console.error("Invalid property for update");
      toast.error("Update failed: Invalid property data");
      return false;
    }
    
    // Format property data for database update
    const propertyData = {
      address: updatedProperty.address,
      city: updatedProperty.city,
      state: updatedProperty.state,
      zip: updatedProperty.zipCode,
      price: updatedProperty.price || 0,
      bedrooms: updatedProperty.bedrooms || 0,
      bathrooms: updatedProperty.bathrooms || 0,
      square_feet: updatedProperty.sqft || 0,
      status: updatedProperty.status,
      images: updatedProperty.imageUrl ? [updatedProperty.imageUrl] : [],
      property_type: updatedProperty.propertyType,
      updated_at: new Date().toISOString()
    };

    console.log("Formatted data for update:", propertyData);
    
    // First, let's check if this is a system property
    const { data: property, error: fetchError } = await supabase
      .from('properties')
      .select('user_id')
      .eq('id', updatedProperty.id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching property before update:", fetchError);
      toast.error(`Cannot update: ${fetchError.message}`);
      return false;
    }
    
    console.log("Property belongs to user_id:", property?.user_id);
    
    // For system properties, we need to use a special approach
    if (property?.user_id === 'system') {
      console.log("This is a system property, using admin API");
      
      // Use the rpc function to bypass RLS for system properties
      const { error } = await supabase.rpc('admin_update_property', {
        property_id: updatedProperty.id,
        property_data: propertyData
      });
      
      if (error) {
        console.error("Admin update error:", error);
        toast.error(`Update failed: ${error.message}`);
        return false;
      }
      
      console.log(`System property ${updatedProperty.id} updated successfully`);
      toast.success("Property updated successfully");
      return true;
    } else {
      // Standard update for user-owned properties
      const { error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', updatedProperty.id);
      
      if (error) {
        console.error("Update error:", error);
        toast.error(`Update failed: ${error.message}`);
        return false;
      }
      
      console.log(`Property ${updatedProperty.id} updated successfully`);
      toast.success("Property updated successfully");
      return true;
    }
  } catch (error: any) {
    console.error('Error updating property:', error);
    toast.error(`Failed to update property: ${error.message}`);
    return false;
  }
}
