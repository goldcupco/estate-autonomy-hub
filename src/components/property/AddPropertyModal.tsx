
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { MLSImporter } from './MLSImporter';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'For Sale' | 'Pending' | 'Sold' | 'Lead' | 'Negotiating';
  imageUrl: string;
  propertyType: 'House' | 'Condo' | 'Land' | 'Commercial' | 'Apartment';
}

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: (property: Property) => void;
  propertyToEdit?: Property | null;
  onPropertyUpdated?: (property: Property) => void;
}

export function AddPropertyModal({ 
  open, 
  onOpenChange, 
  onPropertyAdded, 
  propertyToEdit,
  onPropertyUpdated 
}: AddPropertyModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [property, setProperty] = useState<Partial<Property>>({
    status: 'For Sale',
    propertyType: 'House',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!propertyToEdit;

  // When a property is provided for editing, set the form values
  useEffect(() => {
    if (propertyToEdit) {
      setProperty(propertyToEdit);
      setActiveTab('manual'); // Force manual tab when editing
    }
  }, [propertyToEdit]);

  const handleInputChange = (field: keyof Property, value: any) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!property.address || !property.city || !property.state || !property.zipCode) {
      toast.error('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && propertyToEdit && onPropertyUpdated) {
        // Update existing property
        const updatedProperty = {
          ...propertyToEdit,
          ...property
        } as Property;
        
        // Map property data to database schema
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

        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', updatedProperty.id);
          
        if (error) throw error;
        
        onPropertyUpdated(updatedProperty);
        toast.success('Property updated successfully');
      } else {
        // Add new property
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

        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (error) throw error;

        if (data && onPropertyAdded) {
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
            imageUrl: data.images && data.images.length > 0 ? data.images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
            propertyType: (data.property_type as Property['propertyType']) || 'House'
          };

          onPropertyAdded(newProperty);
          toast.success('Property added successfully');
        }
      }

      onOpenChange(false);
      
      // Reset the form after successful submission
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

        const { data, error } = await supabase
          .from('properties')
          .insert(propertyData)
          .select()
          .single();

        if (error) throw error;

        if (data && onPropertyAdded) {
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
            imageUrl: data.images && data.images.length > 0 ? data.images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
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

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        // Reset form when closing the dialog if not in edit mode
        if (!isEditMode) {
          setProperty({
            status: 'For Sale',
            propertyType: 'House',
          });
        }
        setActiveTab('manual');
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update property details' : 'Enter property details manually or import from MLS'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            {!isEditMode && <TabsTrigger value="import">Import from MLS</TabsTrigger>}
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address*</Label>
                <Input
                  id="address"
                  value={property.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    value={property.city || ''}
                    onChange={e => handleInputChange('city', e.target.value)}
                    placeholder="Austin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State*</Label>
                  <Input
                    id="state"
                    value={property.state || ''}
                    onChange={e => handleInputChange('state', e.target.value)}
                    placeholder="TX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code*</Label>
                  <Input
                    id="zipCode"
                    value={property.zipCode || ''}
                    onChange={e => handleInputChange('zipCode', e.target.value)}
                    placeholder="78701"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={property.price || ''}
                    onChange={e => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="450000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={property.bedrooms || ''}
                    onChange={e => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={property.bathrooms || ''}
                    onChange={e => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                    placeholder="2"
                    step="0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input
                    id="sqft"
                    type="number"
                    value={property.sqft || ''}
                    onChange={e => handleInputChange('sqft', parseInt(e.target.value) || 0)}
                    placeholder="1800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={property.status || 'For Sale'}
                  onValueChange={value => handleInputChange('status', value as Property['status'])}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Negotiating">Negotiating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={property.propertyType || 'House'}
                  onValueChange={value => handleInputChange('propertyType', value as Property['propertyType'])}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={property.imageUrl || ''}
                  onChange={e => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </TabsContent>

          {!isEditMode && (
            <TabsContent value="import" className="mt-4">
              <MLSImporter onImportSuccess={handleImportSuccess} />
            </TabsContent>
          )}
        </Tabs>

        {activeTab === 'manual' && (
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Property' : 'Add Property')
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
