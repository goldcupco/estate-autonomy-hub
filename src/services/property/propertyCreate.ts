
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export async function createProperty(newProperty: Partial<Property>): Promise<Property | null> {
  try {
    console.log("Creating new property:", newProperty);
    
    // Add validation to ensure we have required fields
    if (!newProperty.address || !newProperty.city || !newProperty.state || !newProperty.zipCode) {
      console.error("Missing required fields for property creation");
      toast.error("Cannot create property: Missing required fields");
      return null;
    }
    
    // Format the data for the database
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
      user_id: 'system', // Always use 'system' to bypass RLS
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase for creation:", propertyData);

    // Since this is a system property, use the admin RPC function to bypass RLS
    const { data, error } = await supabase.rpc('admin_create_property', {
      property_data: propertyData
    });
      
    // Log full response details
    console.log("Supabase response:", { data, error });
    
    if (error) {
      console.error("Supabase insert error:", error);
      toast.error(`Creation failed: ${error.message || error.details || 'Unknown error'}`);
      return null;
    }
    
    if (!data) {
      console.error("Property creation returned no data");
      toast.error("Creation failed: No data returned from database");
      return null;
    }
    
    console.log("Raw data returned from insert:", data);
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
    toast.success("Property created successfully");
    return createdProperty;
  } catch (error: any) {
    console.error('Error creating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to create property: ${error.message || 'Unknown error'}`);
    return null;
  }
}
