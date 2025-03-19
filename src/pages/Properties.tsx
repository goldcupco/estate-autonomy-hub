import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import { Button } from '@/components/ui/button';
import { Building, Plus, Database, X } from 'lucide-react';
import { DataUploader } from '@/components/ui/DataUploader';
import { MLSImporter } from '@/components/property/MLSImporter';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { supabase } from '@/utils/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

// Define the property type
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
  
  // Fetch properties from the database
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
          // Map database properties to the Property interface
          const formattedProperties: Property[] = data.map(property => ({
            id: property.id,
            address: property.address || '',
            city: property.city || '',
            state: property.state || '',
            zipCode: property.zip_code || '',
            price: property.price || 0,
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            sqft: property.square_feet || 0,
            status: (property.status as Property['status']) || 'For Sale',
            // Changed from image_url to image_uri
            imageUrl: property.image_uri || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', 
            propertyType: (property.property_type as Property['propertyType']) || 'House'
          }));
          
          setProperties(formattedProperties);
        } else {
          // If no properties found, show empty state
          setProperties([]);
          toast("No properties found. Add a new property to get started.");
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        toast("Error fetching properties.");
        // Set empty array so UI doesn't stay in loading state
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
  
  const handleImportSuccess = async (newProperties: any[]) => {
    try {
      // Save the imported properties to Supabase
      for (const property of newProperties) {
        await supabase.from('properties').insert({
          address: property.address,
          city: property.city,
          state: property.state,
          zip_code: property.zipCode,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          square_feet: property.sqft,
          status: property.status,
          // Changed from image_url to image_uri
          image_uri: property.imageUrl,
          property_type: property.propertyType,
          user_id: 'system', // This would be the actual user ID in a real app
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Refresh the properties list
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) {
        const formattedProperties: Property[] = data.map(property => ({
          id: property.id,
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          zipCode: property.zip_code || '',
          price: property.price || 0,
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          sqft: property.square_feet || 0,
          status: (property.status as Property['status']) || 'For Sale',
          // Changed from image_url to image_uri
          imageUrl: property.image_uri || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
          propertyType: (property.property_type as Property['propertyType']) || 'House'
        }));
        
        setProperties(formattedProperties);
      }
      
      toast.success(`Successfully imported ${newProperties.length} properties from MLS`);
      setShowImporter(false);
    } catch (error) {
      console.error('Error saving imported properties:', error);
      toast.error('Failed to import properties');
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
                      <MLSImporter onImportSuccess={handleImportSuccess} />
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button className="flex items-center gap-2 animate-scale-in" onClick={() => navigate('/property/new')}>
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
                <Button onClick={() => navigate('/property/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </div>
            ) : (
              <PropertyGrid 
                properties={properties} 
                onPropertyClick={(id) => navigate(`/property/${id}`)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Properties;
