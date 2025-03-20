
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
    console.log(`Attempting to delete property with ID: ${propertyId}`);
    
    if (!propertyId || propertyId.trim() === '') {
      console.error("Invalid property ID for deletion");
      toast.error("Cannot delete: Invalid property ID");
      return false;
    }
    
    // First, verify the property exists
    const { data: existingProperty, error: getError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();
    
    if (getError || !existingProperty) {
      console.error("Error verifying property before delete:", getError);
      toast.error("Cannot delete: Property not found");
      return false;
    }
    
    console.log("Property verified, proceeding with deletion");
    
    // Make the database request and await the response
    const { error, status } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);
      
    // Log the response status for debugging
    console.log(`Delete operation status: ${status}`);
    
    if (error) {
      console.error("Supabase delete error:", error);
      toast.error(`Delete failed: ${error.message}`);
      return false;
    }
    
    // Verify the property was actually deleted
    const { data: checkDeleted, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId);
      
    if (checkError) {
      console.error("Error verifying deletion:", checkError);
      return false;
    }
    
    if (checkDeleted && checkDeleted.length > 0) {
      console.error("Property still exists after delete operation");
      toast.error("Delete operation failed: Property still exists");
      return false;
    }
    
    console.log("Property deleted successfully from database");
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    toast.error("Failed to delete property");
    return false;
  }
}

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
      images: updatedProperty.imageUrl ? [updatedProperty.imageUrl] : null,
      property_type: updatedProperty.propertyType,
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase:", propertyData);

    // Perform the update and await the response
    const { error, status } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', updatedProperty.id);
      
    // Log the response status for debugging
    console.log(`Update operation status: ${status}`);
      
    if (error) {
      console.error("Supabase update error:", error);
      toast.error(`Update failed: ${error.message}`);
      return false;
    }
    
    // Verify the update was successful
    const { data: updatedData, error: verifyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', updatedProperty.id)
      .single();
      
    if (verifyError || !updatedData) {
      console.error("Error verifying update:", verifyError);
      toast.error("Update verification failed");
      return false;
    }
    
    console.log("Verification successful, updated data:", updatedData);
    console.log("Property updated successfully in database");
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
    
    // Add validation to ensure we have required fields
    if (!newProperty.address || !newProperty.city || !newProperty.state || !newProperty.zipCode) {
      console.error("Missing required fields for property creation");
      toast.error("Cannot create property: Missing required fields");
      return null;
    }
    
    // Validate that the data types are correct
    const propertyData = {
      address: String(newProperty.address),
      city: String(newProperty.city),
      state: String(newProperty.state),
      zip: String(newProperty.zipCode),
      price: Number(newProperty.price) || 0,
      bedrooms: Number(newProperty.bedrooms) || 0,
      bathrooms: Number(newProperty.bathrooms) || 0,
      square_feet: Number(newProperty.sqft) || 0,
      status: newProperty.status || 'For Sale',
      images: newProperty.imageUrl ? [newProperty.imageUrl] : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
      property_type: newProperty.propertyType || 'House',
      user_id: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase:", propertyData);

    // Execute insert and await the response
    const { data, error, status } = await supabase
      .from('properties')
      .insert(propertyData)
      .select();
      
    // Log the response status for debugging
    console.log(`Create operation status: ${status}`);
      
    if (error) {
      console.error("Supabase insert error:", error);
      toast.error(`Creation failed: ${error.message}`);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log("Raw data returned from insert:", data[0]);
      const createdProperty: Property = {
        id: data[0].id,
        address: data[0].address || '',
        city: data[0].city || '',
        state: data[0].state || '',
        zipCode: data[0].zip || '',
        price: data[0].price || 0,
        bedrooms: data[0].bedrooms || 0,
        bathrooms: data[0].bathrooms || 0,
        sqft: data[0].square_feet || 0,
        status: (data[0].status as Property['status']) || 'For Sale',
        imageUrl: data[0].images && data[0].images[0] ? data[0].images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        propertyType: (data[0].property_type as Property['propertyType']) || 'House'
      };
      
      console.log("Property created successfully:", createdProperty);
      return createdProperty;
    }
    
    console.error("Property created but no data returned");
    return null;
  } catch (error) {
    console.error('Error creating property:', error);
    toast.error("Failed to create property");
    return null;
  }
}
