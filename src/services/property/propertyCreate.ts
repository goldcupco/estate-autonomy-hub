
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
    
    // Check authentication state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    let userId = 'anonymous';
    if (session && session.user) {
      userId = session.user.id;
      console.log("Current authenticated user ID for property creation:", userId);
    } else {
      console.log("No authenticated session found, using anonymous user ID");
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
      user_id: userId, // Use the user ID from session or default to anonymous
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log("Sending to Supabase for creation:", propertyData);

    // Execute insert and await the response
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select();
      
    // Log full response details
    console.log("Supabase response:", { data, error });
    
    if (error) {
      console.error("Supabase insert error:", error);
      
      // Check if this is an RLS policy violation
      if (error.code === '42501' || error.message?.includes('policy')) {
        console.error("This appears to be a Row Level Security (RLS) policy violation");
        toast.error("You don't have permission to create properties. Please log in and try again.");
      } else {
        toast.error(`Creation failed: ${error.message || error.details || 'Unknown error'}`);
      }
      
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error("Property creation returned no data");
      toast.error("Creation failed: No data returned from database");
      return null;
    }
    
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
    toast.success("Property created successfully");
    return createdProperty;
  } catch (error: any) {
    console.error('Error creating property:', error);
    console.error('Error details:', error.message, error.stack);
    toast.error(`Failed to create property: ${error.message || 'Unknown error'}`);
    return null;
  }
}
