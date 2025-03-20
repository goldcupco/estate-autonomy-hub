
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export async function fetchProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      const formattedProperties: Property[] = data.map(property => {
        let imageUrl = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
        if (property.images && Array.isArray(property.images) && property.images.length > 0) {
          const firstImage = property.images[0];
          if (typeof firstImage === 'string') {
            imageUrl = firstImage;
          }
        }
        
        return {
          id: property.id,
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          zipCode: property.zip || '',
          price: property.price || 0,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          sqft: property.square_feet || 0,
          status: (property.status as Property['status']) || 'For Sale',
          imageUrl,
          propertyType: (property.property_type as Property['propertyType']) || 'House'
        };
      });
      
      return formattedProperties;
    } else {
      toast("No properties found. Add a new property to get started.");
      return [];
    }
  } catch (err) {
    console.error('Error fetching properties:', err);
    toast.error("Error fetching properties.");
    return [];
  }
}

export async function deleteProperty(propertyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
      
    if (error) throw error;
    
    toast.success("Property deleted successfully");
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    toast.error("Failed to delete property");
    return false;
  }
}

export async function updateProperty(updatedProperty: Property): Promise<boolean> {
  try {
    console.log("Updating property:", updatedProperty);
    
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
      images: [updatedProperty.imageUrl],
      property_type: updatedProperty.propertyType,
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase:", propertyData);

    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id)
      .select();
      
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Supabase update response:", data);
    
    toast.success("Property updated successfully");
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    toast.error("Failed to update property");
    return false;
  }
}
