
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Property } from '@/pages/Properties';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { deleteProperty, fetchProperties } from '@/services/propertyService';

export function PropertyList() {
  const navigate = useNavigate();
  const { 
    properties, 
    isLoading, 
    setProperties,
    setEditingProperty, 
    setAddPropertyOpen,
    setIsLoading
  } = usePropertyContext();

  const refreshProperties = async () => {
    try {
      setIsLoading(true);
      console.log("Refreshing properties from PropertyList component");
      const refreshedProperties = await fetchProperties();
      setProperties(refreshedProperties);
    } catch (error) {
      console.error("Error refreshing properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const success = await deleteProperty(propertyId);
    if (success) {
      setProperties(properties.filter(property => property.id !== propertyId));
      // Refresh the properties to ensure we have the latest data
      refreshProperties();
    }
  };

  const handleEditProperty = (property: Property) => {
    console.log("Editing property:", property);
    setEditingProperty(property);
    setAddPropertyOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <Skeleton key={index} className="h-[300px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground mb-4">Add your first property to get started</p>
        <div className="flex flex-col gap-2 items-center">
          <Button onClick={() => setAddPropertyOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
          <Button variant="outline" onClick={refreshProperties} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PropertyGrid 
        properties={properties} 
        onPropertyClick={handlePropertyClick}
        onDeleteProperty={handleDeleteProperty}
        onEditProperty={handleEditProperty}
      />
    </div>
  );
}
