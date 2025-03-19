import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Button } from '@/components/ui/button';
import { Building, Plus, Database } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { MLSImporter } from '@/components/property/MLSImporter';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';

export interface Property {
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

export function Properties() {
  const navigate = useNavigate();
  const [showImporter, setShowImporter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
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
          
          setProperties(formattedProperties);
        } else {
          setProperties([]);
          toast("No properties found. Add a new property to get started.");
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        toast.error("Error fetching properties.");
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);
  
  const handlePropertyAdded = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    toast.success("Property added successfully");
  };
  
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setAddPropertyOpen(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
        
      if (error) throw error;
      
      setProperties(prev => prev.filter(property => property.id !== propertyId));
      
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error("Failed to delete property");
    }
  };
  
  const handleUpdateProperty = async (updatedProperty: Property) => {
    try {
      const propertyData = {
        address: updatedProperty.address,
        city: updatedProperty.city,
        state: updatedProperty.state,
        zip: updatedProperty.zipCode,
        price: updatedProperty.price,
        bedrooms: updatedProperty.bedrooms,
        bathrooms: updatedProperty.bathrooms,
        square_feet: updatedProperty.sqft,
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
      
      setProperties(prev => 
        prev.map(property => 
          property.id === updatedProperty.id ? updatedProperty : property
        )
      );
      
      toast.success("Property updated successfully");
      setEditingProperty(null);
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error("Failed to update property");
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-6 py-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 animate-scale-in">
                      <Database className="h-4 w-4" />
                      <span>Import MLS Data</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Import MLS Data</SheetTitle>
                      <SheetDescription>
                        Connect to an MLS system or upload a CSV file to import property listings.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <MLSImporter onImportSuccess={(props) => {
                        const fetchProperties = async () => {
                          const { data } = await supabase
                            .from('properties')
                            .select('*')
                            .order('created_at', { ascending: false });
                            
                          if (data) {
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
                            
                            setProperties(formattedProperties);
                          }
                        };
                        
                        fetchProperties();
                        toast.success(`Successfully imported ${props.length} properties from MLS`);
                      }} />
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button 
                  className="flex items-center gap-2 animate-scale-in" 
                  onClick={() => {
                    setEditingProperty(null);
                    setAddPropertyOpen(true);
                  }}
                >
                  <Building className="h-4 w-4" />
                  <span>Add Property</span>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-[300px] rounded-lg" />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-lg">
                <h3 className="text-lg font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">Add your first property to get started</p>
                <Button onClick={() => setAddPropertyOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </div>
            ) : (
              <PropertyGrid 
                properties={properties} 
                onPropertyClick={(id) => navigate(`/property/${id}`)}
                onDeleteProperty={handleDeleteProperty}
                onEditProperty={handleEditProperty}
              />
            )}
          </div>
        </main>
      </div>

      <AddPropertyModal
        open={addPropertyOpen}
        onOpenChange={setAddPropertyOpen}
        onPropertyAdded={handlePropertyAdded}
        propertyToEdit={editingProperty}
        onPropertyUpdated={handleUpdateProperty}
      />
    </div>
  );
}

export default Properties;
