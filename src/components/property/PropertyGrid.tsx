
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash, Pencil, Building, Home, MapPin } from 'lucide-react';
import { Property } from '@/pages/Properties';
import { formatCurrency } from '@/lib/utils';

interface PropertyGridProps {
  properties: Property[];
  onPropertyClick: (id: string) => void;
  onDeleteProperty?: (id: string) => void;
  onEditProperty?: (property: Property) => void;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  onPropertyClick,
  onDeleteProperty,
  onEditProperty
}) => {
  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'For Sale': return 'bg-green-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Sold': return 'bg-blue-500';
      case 'Lead': return 'bg-purple-500';
      case 'Negotiating': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPropertyTypeIcon = (type: Property['propertyType']) => {
    switch (type) {
      case 'House': return <Home className="h-4 w-4" />;
      case 'Commercial': return <Building className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden transition-all duration-200 hover:shadow-lg">
          <div 
            className="h-48 bg-cover bg-center cursor-pointer" 
            style={{ backgroundImage: `url(${property.imageUrl})` }}
            onClick={() => onPropertyClick(property.id)}
          />
          
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold line-clamp-1">{property.address}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
              <Badge className={`${getStatusColor(property.status)} text-white`}>
                {property.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-semibold">{formatCurrency(property.price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Beds</p>
                <p className="font-semibold">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Baths</p>
                <p className="font-semibold">{property.bathrooms}</p>
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <div className="bg-muted rounded-full p-1">
                {getPropertyTypeIcon(property.propertyType)}
              </div>
              <span className="text-xs">{property.propertyType}</span>
              
              <div className="bg-muted rounded-full p-1 ml-2">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-xs">{property.sqft} sqft</span>
            </div>
          </CardContent>
          
          {(onDeleteProperty || onEditProperty) && (
            <CardFooter className="p-4 pt-0 flex justify-end gap-2">
              {onEditProperty && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEditProperty(property)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDeleteProperty && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this property?')) {
                      onDeleteProperty(property.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};
