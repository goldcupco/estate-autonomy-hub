
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
    
    // Try to get the auth user ID to debug RLS issues
    const { data: authData } = await supabase.auth.getUser();
    console.log("Current auth user:", authData?.user?.id || "No authenticated user");
    console.log("Property ID for update:", updatedProperty.id);
    
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

    console.log("Formatted data for Supabase:", propertyData);
    
    // System properties may use "system" as user_id
    console.log("Attempting direct property update:");
    console.log("- Current timestamp:", new Date().toISOString());
    
    // Direct update without verifying user_id first
    const { error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    console.log("Update response:", error ? error : "Success (no error)");
    
    if (error) {
      console.error("Supabase update error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);
      
      toast.error(`Update failed: ${error.message || error.details || 'Unknown error'}`);
      return false;
    }
    
    console.log("Property updated successfully in database");
    toast.success("Property updated successfully");
    return true;
  } catch (error: any) {
    console.error('Error updating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to update property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
