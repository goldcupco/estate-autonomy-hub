
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export async function fetchProperties(): Promise<Property[]> {
  try {
    console.log("Making Supabase request to fetch properties...");
    
    // Check authentication state but don't require it
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No authenticated session found when fetching properties - continuing as public access");
    } else {
      console.log("Authenticated session found for fetching properties");
    }
    
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
