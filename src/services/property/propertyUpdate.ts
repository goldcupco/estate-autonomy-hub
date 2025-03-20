
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError);
      toast.error("Update failed: Authentication error");
      return false;
    }
    
    if (!user) {
      console.error("No authenticated user found");
      toast.error("Update failed: You must be logged in");
      return false;
    }
    
    console.log("Current authenticated user ID for property update:", user.id);
    
    // Convert property format to match the database schema
    // IMPORTANT: Do not include user_id in the update to avoid RLS issues
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
      // Deliberately NOT updating user_id as this could break RLS
    };

    console.log("Sending to Supabase for update:", propertyData);
    console.log("Property ID for update:", updatedProperty.id);

    // Execute the update operation
    const { error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    if (error) {
      console.error("Supabase update error:", error);
      
      // Check if this is an RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error("This appears to be a Row Level Security (RLS) policy violation");
        toast.error("You don't have permission to update this property");
      } else {
        toast.error(`Update failed: ${error.message || error.details || 'Unknown error'}`);
      }
      
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
