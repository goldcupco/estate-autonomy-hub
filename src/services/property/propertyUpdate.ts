
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
    
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use the actual user ID if available, otherwise use 'system'
    const userId = user?.id || 'system';
    console.log("Current user ID:", userId);
    
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
      user_id: userId
    };

    console.log("Sending to Supabase:", propertyData);
    console.log("Property ID for update:", updatedProperty.id);

    // First check if the property exists
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id, user_id')
      .eq('id', updatedProperty.id)
      .single();
      
    if (fetchError) {
      console.error("Property not found or fetch error:", fetchError);
      toast.error("Update failed: Property not found");
      return false;
    }
    
    if (!existingProperty) {
      console.error("Property not found");
      toast.error("Update failed: Property not found");
      return false;
    }
    
    console.log("Property exists, belongs to user:", existingProperty.user_id);
    console.log("Current user:", userId);
    
    // Perform the update
    const { error: updateError } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    if (updateError) {
      console.error("Supabase update error:", updateError);
      toast.error(`Update failed: ${updateError.message || updateError.details || 'Unknown error'}`);
      
      // Check if this is an RLS policy violation
      if (updateError.code === '42501' || updateError.message?.includes('policy')) {
        console.error("This appears to be a Row Level Security (RLS) policy violation");
        toast.error("You don't have permission to update this property");
      }
      
      return false;
    }
    
    // If update succeeded, fetch the updated record to confirm
    const { data: updatedData, error: fetchUpdatedError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', updatedProperty.id)
      .single();
      
    if (fetchUpdatedError) {
      console.error("Failed to fetch updated property:", fetchUpdatedError);
      toast.warning("Property may have been updated but couldn't confirm");
      return true; // Assume it worked since the update didn't error
    }
    
    if (!updatedData) {
      console.error("Updated property not found");
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
