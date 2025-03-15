
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MLSImporter } from './MLSImporter';

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
  status: 'For Sale' | 'Pending' | 'Sold' | 'Lead';
  imageUrl?: string;
}

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: (property: Property) => void;
}

export function AddPropertyModal({ open, onOpenChange, onPropertyAdded }: AddPropertyModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [property, setProperty] = useState<Partial<Property>>({
    status: 'For Sale',
  });

  const handleInputChange = (field: keyof Property, value: any) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!property.address || !property.city || !property.state || !property.zipCode) {
      toast.error('Please fill out all required fields');
      return;
    }

    // In a real app, this would call an API to save the property
    const newProperty = {
      ...property,
      id: `prop-${Date.now()}`,
      price: property.price || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      sqft: property.sqft || 0,
      status: property.status || 'For Sale',
      imageUrl: property.imageUrl || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'
    } as Property;

    if (onPropertyAdded) {
      onPropertyAdded(newProperty);
    }

    toast.success('Property added successfully');
    onOpenChange(false);
  };

  const handleImportSuccess = (properties: Property[]) => {
    if (properties.length > 0) {
      if (onPropertyAdded) {
        // Only add the first property for simplicity
        onPropertyAdded(properties[0]);
      }
      toast.success(`Imported ${properties.length} properties successfully`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Enter property details manually or import from MLS
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">Import from MLS</TabsTrigger>
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
                    onChange={e => handleInputChange('price', parseFloat(e.target.value))}
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
                    onChange={e => handleInputChange('bedrooms', parseInt(e.target.value))}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={property.bathrooms || ''}
                    onChange={e => handleInputChange('bathrooms', parseFloat(e.target.value))}
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
                    onChange={e => handleInputChange('sqft', parseInt(e.target.value))}
                    placeholder="1800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={property.status || 'For Sale'}
                  onValueChange={value => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
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

          <TabsContent value="import" className="mt-4">
            <MLSImporter onImportSuccess={handleImportSuccess} />
          </TabsContent>
        </Tabs>

        {activeTab === 'manual' && (
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Property</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
