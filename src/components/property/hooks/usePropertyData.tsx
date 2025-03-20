
import { useState, useEffect } from 'react';
import { Property } from '@/pages/Properties';
import { toast } from 'sonner';
import { createProperty, updateProperty } from '@/services/propertyService';

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
    } else {
      resetProperty();
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
        console.log("Importing property:", properties[0]);
        const newProperty = await createProperty(properties[0]);
        
        if (newProperty && onPropertyAdded) {
          console.log("Import successful, adding to UI:", newProperty);
          onPropertyAdded(newProperty);
          toast.success(`Imported ${properties.length} properties successfully`);
          onOpenChange(false);
        } else {
          console.error("Failed to import property - no property returned");
          toast.error('Failed to import property');
        }
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
        
        const success = await updateProperty(updatedProperty);
        
        if (success) {
          console.log("Update successful, updating UI with:", updatedProperty);
          onPropertyUpdated(updatedProperty);
          toast.success('Property updated successfully');
          onOpenChange(false);
        } else {
          console.error("Failed to update property - database update failed");
          toast.error('Failed to update property');
        }
      } else {
        console.log("Preparing to create new property with data:", property);
        
        // Ensure we have all required data formatted correctly
        const propertyToCreate = {
          ...property,
          // Set default values for any missing fields
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          sqft: property.sqft || 0,
          price: property.price || 0,
          status: property.status || 'For Sale',
          propertyType: property.propertyType || 'House'
        };
        
        const newProperty = await createProperty(propertyToCreate);
        
        if (newProperty && onPropertyAdded) {
          console.log("Creation successful, adding to UI:", newProperty);
          onPropertyAdded(newProperty);
          toast.success('Property added successfully');
          onOpenChange(false);
        } else {
          console.error("Failed to add property - no property returned");
          toast.error('Failed to add property');
        }
      }
      
      if (!isEditMode) {
        resetProperty();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(isEditMode ? 'Failed to update property' : 'Failed to add property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProperty = () => {
    setProperty({
      status: 'For Sale',
      propertyType: 'House',
    });
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
