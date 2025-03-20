
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export async function fetchProperties(): Promise<Property[]> {
  try {
    console.log("Making Supabase request to fetch properties...");
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Raw data from Supabase:", data);
    
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
      
      console.log("Formatted properties:", formattedProperties);
      return formattedProperties;
    } else {
      console.log("No properties found");
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
    console.log("Deleting property with ID:", propertyId);
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
      
    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }
    
    console.log("Property deleted successfully");
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
      images: [updatedProperty.imageUrl],
      property_type: updatedProperty.propertyType,
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase:", propertyData);

    const { error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
    
    console.log("Property updated successfully");
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    toast.error("Failed to update property");
    return false;
  }
}

export async function createProperty(newProperty: Partial<Property>): Promise<Property | null> {
  try {
    console.log("Creating new property:", newProperty);
    
    const propertyData = {
      address: newProperty.address,
      city: newProperty.city,
      state: newProperty.state,
      zip: newProperty.zipCode,
      price: newProperty.price || 0,
      bedrooms: newProperty.bedrooms || 0,
      bathrooms: newProperty.bathrooms || 0,
      square_feet: newProperty.sqft || 0,
      status: newProperty.status || 'For Sale',
      images: newProperty.imageUrl ? [newProperty.imageUrl] : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
      property_type: newProperty.propertyType || 'House',
      user_id: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase:", propertyData);

    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select('*')
      .single();
      
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    
    if (data) {
      const createdProperty: Property = {
        id: data.id,
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip || '',
        price: data.price || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        sqft: data.square_feet || 0,
        status: (data.status as Property['status']) || 'For Sale',
        imageUrl: data.images && data.images[0] ? data.images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        propertyType: (data.property_type as Property['propertyType']) || 'House'
      };
      
      console.log("Property created successfully:", createdProperty);
      return createdProperty;
    }
    
    console.log("Property created but no data returned");
    return null;
  } catch (error) {
    console.error('Error creating property:', error);
    toast.error("Failed to create property");
    return null;
  }
}
