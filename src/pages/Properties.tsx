import { useState, useEffect, useCallback } from 'react';
import { PropertyList } from '@/components/property/PropertyList';
import { PropertyActions } from '@/components/property/PropertyActions';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { fetchProperties } from '@/services/property';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    properties,
    setProperties,
    isLoading,
    setIsLoading,
    editingProperty,
    setEditingProperty,
    addPropertyOpen,
    setAddPropertyOpen
  } = usePropertyContext();
  
  const loadProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading properties from database...");
      const fetchedProperties = await fetchProperties();
      console.log("Properties loaded:", fetchedProperties);
      setProperties(fetchedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setProperties]);
  
  useEffect(() => {
    console.log("Properties component mounted, loading properties...");
    loadProperties();
    
    const refreshInterval = setInterval(() => {
      console.log("Automatic refresh of properties...");
      loadProperties();
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [loadProperties]);

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
    console.log("Property added, updating UI:", newProperty);
    setProperties([...properties, newProperty]);
    loadProperties();
    toast.success("Property added successfully");
  };
  
  const handleUpdateProperty = (updatedProperty: Property) => {
    console.log("Property updated, updating UI:", updatedProperty);
    const updatedProperties = properties.map(property => 
      property.id === updatedProperty.id ? updatedProperty : property
    );
    setProperties(updatedProperties);
    setEditingProperty(null);
    loadProperties();
    toast.success("Property updated successfully");
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
              <PropertyActions onRefresh={loadProperties} />
            </div>
            
            <PropertyList />
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
