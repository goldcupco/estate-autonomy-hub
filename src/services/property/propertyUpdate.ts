
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
    
    // Convert property format to match the database schema
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
      updated_at: new Date().toISOString(),
      // Use auth.uid() when authenticated, fallback to 'system' for now
      user_id: 'system'
    };

    console.log("Sending to Supabase:", propertyData);
    console.log("Property ID for update:", updatedProperty.id);

    // First check if the property exists
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', updatedProperty.id)
      .single();
      
    if (fetchError || !existingProperty) {
      console.error("Property not found or fetch error:", fetchError);
      toast.error("Update failed: Property not found");
      return false;
    }
    
    console.log("Property exists, proceeding with update");
    
    // Perform a direct update without returning data first to see if it works
    const { error: updateError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    if (updateError) {
      console.error("Supabase direct update error:", updateError);
      toast.error(`Update failed: ${updateError.message || updateError.details || 'Unknown error'}`);
      return false;
    }
    
    // If direct update succeeded, fetch the updated record to confirm
    const { data: updatedData, error: fetchUpdatedError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', updatedProperty.id)
      .single();
      
    if (fetchUpdatedError || !updatedData) {
      console.error("Failed to fetch updated property:", fetchUpdatedError);
      toast.warning("Property may have been updated but couldn't confirm");
      return true; // Assume it worked since the update didn't error
    }
    
    console.log("Property updated successfully in database, updated data:", updatedData);
    toast.success("Property updated successfully");
    return true;
  } catch (error: any) {
    console.error('Error updating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to update property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
