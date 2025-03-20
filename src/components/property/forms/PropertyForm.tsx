
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property } from '@/pages/Properties';

interface PropertyFormProps {
  property: Partial<Property>;
  handleInputChange: (field: keyof Property, value: any) => void;
}

export function PropertyForm({ property, handleInputChange }: PropertyFormProps) {
  return (
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
  );
}
