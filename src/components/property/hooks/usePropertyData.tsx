
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
        const newProperty = await createProperty(properties[0]);
        
        if (newProperty && onPropertyAdded) {
          onPropertyAdded(newProperty);
          toast.success(`Imported ${properties.length} properties successfully`);
        } else {
          toast.error('Failed to import property');
        }
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
        
        const success = await updateProperty(updatedProperty);
        
        if (success) {
          onPropertyUpdated(updatedProperty);
          toast.success('Property updated successfully');
          onOpenChange(false);
        } else {
          toast.error('Failed to update property');
        }
      } else {
        const newProperty = await createProperty(property);
        
        if (newProperty && onPropertyAdded) {
          onPropertyAdded(newProperty);
          toast.success('Property added successfully');
          onOpenChange(false);
        } else {
          toast.error('Failed to add property');
        }
      }
      
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
