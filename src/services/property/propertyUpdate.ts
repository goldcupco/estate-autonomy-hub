
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
    
    // Check if the property exists first
    const { data: existingProperty, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', updatedProperty.id)
      .single();
    
    if (checkError) {
      console.error("Error checking if property exists:", checkError);
      toast.error(`Update failed: Property not found or access denied`);
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
      user_id: 'system', // Explicitly set to bypass RLS
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase for update:", propertyData);
    console.log("Property ID for update:", updatedProperty.id);

    // Execute the update operation using match for more precise targeting
    const { error } = await supabase
      .from('properties')
      .update(propertyData)
      .match({ id: updatedProperty.id });
      
    if (error) {
      console.error("Supabase update error:", error);
      toast.error(`Update failed: ${error.message || error.details || 'Unknown error'}`);
      return false;
    }
    
    // Verify the update actually worked
    const { data: verifyProperty, error: verifyError } = await supabase
      .from('properties')
      .select('address, updated_at')
      .eq('id', updatedProperty.id)
      .single();
    
    if (verifyError) {
      console.error("Error verifying update:", verifyError);
      toast.warning("Update may have failed to persist");
      return false;
    }
    
    if (verifyProperty.address !== updatedProperty.address) {
      console.error("Update verification failed - data mismatch");
      toast.error("Update failed: Database doesn't reflect changes");
      return false;
    }
    
    console.log("Property updated successfully in database:", verifyProperty);
    toast.success("Property updated successfully");
    return true;
  } catch (error: any) {
    console.error('Error updating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to update property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
