
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';

export function usePropertyData(
  propertyToEdit: Property | null,
  onOpenChange: (open: boolean) => void,
  onPropertyAdded?: (property: Property) => void,
  onPropertyUpdated?: (property: Property) => void
) {
  const [property, setProperty] = useState<Partial<Property>>({
    status: 'For Sale',
    propertyType: 'House',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!propertyToEdit;

  useEffect(() => {
    if (propertyToEdit) {
      setProperty(propertyToEdit);
    }
  }, [propertyToEdit]);

  const handleInputChange = (field: keyof Property, value: any) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImportSuccess = async (properties: any[]) => {
    setIsSubmitting(true);
    
    try {
      if (properties.length > 0) {
        const propertyData = {
          address: properties[0].address,
          city: properties[0].city,
          state: properties[0].state,
          zip: properties[0].zipCode,
          price: properties[0].price || 0,
          bedrooms: properties[0].bedrooms || 0,
          bathrooms: properties[0].bathrooms || 0,
          square_feet: properties[0].sqft || 0,
          status: properties[0].status || 'For Sale',
          images: properties[0].imageUrl ? [properties[0].imageUrl] : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
          property_type: properties[0].propertyType || 'House',
          user_id: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log("Inserting property data:", propertyData);

        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        if (data && onPropertyAdded) {
          const defaultImageUrl = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
          let imageUrl = defaultImageUrl;
          
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const firstImage = data.images[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            }
          }
          
          const newProperty: Property = {
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
            imageUrl,
            propertyType: (data.property_type as Property['propertyType']) || 'House'
          };
          onPropertyAdded(newProperty);
        }

        toast.success(`Imported ${properties.length} properties successfully`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error importing property:', error);
      toast.error('Failed to import property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateProperty = () => {
    if (!property.address || !property.city || !property.state || !property.zipCode) {
      toast.error('Please fill out all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateProperty()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && propertyToEdit && onPropertyUpdated) {
        const updatedProperty = {
          ...propertyToEdit,
          ...property
        } as Property;
        
        console.log("Preparing to update property with data:", updatedProperty);
        
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

        console.log("Sending property update to Supabase:", propertyData);

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
        
        if (!data || data.length === 0) {
          console.warn("No data returned from update operation");
        }
        
        onPropertyUpdated(updatedProperty);
        toast.success('Property updated successfully');
      } else {
        const propertyData = {
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zipCode,
          price: property.price || 0,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          square_feet: property.sqft || 0,
          status: property.status || 'For Sale',
          images: property.imageUrl ? [property.imageUrl] : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
          property_type: property.propertyType || 'House',
          user_id: 'system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log("Inserting new property data:", propertyData);

        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        if (data && onPropertyAdded) {
          const defaultImageUrl = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994';
          let imageUrl = defaultImageUrl;
          
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const firstImage = data.images[0];
            if (typeof firstImage === 'string') {
              imageUrl = firstImage;
            }
          }
          
          const newProperty: Property = {
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
            imageUrl,
            propertyType: (data.property_type as Property['propertyType']) || 'House'
          };

          onPropertyAdded(newProperty);
          toast.success('Property added successfully');
        }
      }

      onOpenChange(false);
      
      if (!isEditMode) {
        setProperty({
          status: 'For Sale',
          propertyType: 'House',
        });
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(isEditMode ? 'Failed to update property' : 'Failed to add property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProperty = () => {
    if (!isEditMode) {
      setProperty({
        status: 'For Sale',
        propertyType: 'House',
      });
    }
  };

  return {
    property,
    isSubmitting,
    isEditMode,
    handleInputChange,
    handleImportSuccess,
    handleSubmit,
    resetProperty
  };
}
