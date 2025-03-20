
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Property } from '@/pages/Properties';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { useNavigate } from 'react-router-dom';
import { deleteProperty, fetchProperties } from '@/services/property';
import { toast } from 'sonner';

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
      console.log("Refreshed properties:", refreshedProperties);
      setProperties(refreshedProperties);
      toast.success("Properties refreshed");
    } catch (error) {
      console.error("Error refreshing properties:", error);
      toast.error("Failed to refresh properties");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = (id: string) => {
    navigate(`/property/${id}`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!propertyId) {
      toast.error("Invalid property ID");
      return;
    }
    
    try {
      console.log("Attempting to delete property with ID:", propertyId);
      setIsLoading(true);
      
      // Attempt the database deletion with enhanced debugging
      console.log("Calling deleteProperty service function...");
      const success = await deleteProperty(propertyId);
      console.log("deleteProperty result:", success);
      
      if (success) {
        // Remove the deleted property from state immediately
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success("Property deleted successfully");
      } else {
        toast.error("Failed to delete property");
      }
      
      // Force a complete refresh to ensure UI is in sync with database
      console.log("Forcing property refresh after delete operation");
      await refreshProperties();
    } catch (error) {
      console.error("Error in handleDeleteProperty:", error);
      toast.error("An error occurred while deleting the property");
    } finally {
      setIsLoading(false);
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
      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={refreshProperties} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Properties
        </Button>
      </div>
      <PropertyGrid 
        properties={properties} 
        onPropertyClick={handlePropertyClick}
        onDeleteProperty={handleDeleteProperty}
        onEditProperty={handleEditProperty}
      />
    </div>
  );
}
