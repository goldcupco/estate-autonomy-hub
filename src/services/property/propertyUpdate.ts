
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

    // Request the data back to confirm the update and add count option
    const { data, error, status, statusText, count } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id)
      .select()
      .returns<any>();
    
    // Detailed logging for debugging
    console.log("Supabase update response:", { 
      data, 
      error, 
      status, 
      statusText,
      count,
      affectedRows: data?.length || 0
    });
      
    if (error) {
      console.error("Supabase update error:", error);
      toast.error(`Update failed: ${error.message || error.details || 'Unknown error'}`);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error("No rows updated. Property might not exist or you don't have permission.");
      toast.error("Update failed: Property couldn't be updated");
      return false;
    }
    
    console.log("Property updated successfully in database, updated data:", data);
    toast.success("Property updated successfully");
    return true;
  } catch (error: any) {
    console.error('Error updating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to update property: ${error.message || 'Unknown error'}`);
    return false;
  }
}
