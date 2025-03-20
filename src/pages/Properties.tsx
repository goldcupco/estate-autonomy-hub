
import { useState, useEffect, useCallback } from 'react';
import { PropertyList } from '@/components/property/PropertyList';
import { PropertyActions } from '@/components/property/PropertyActions';
import { toast } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import { AddPropertyModal } from '@/components/property/AddPropertyModal';
import { usePropertyContext } from '@/contexts/PropertyContext';
import { fetchProperties, updateProperty } from '@/services/propertyService';

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
    setIsLoading(true);
    const fetchedProperties = await fetchProperties();
    setProperties(fetchedProperties);
    setIsLoading(false);
  }, [setIsLoading, setProperties]);
  
  useEffect(() => {
    loadProperties();
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
    setProperties(prev => [newProperty, ...prev]);
    toast.success("Property added successfully");
  };
  
  const handleUpdateProperty = async (updatedProperty: Property) => {
    const success = await updateProperty(updatedProperty);
    if (success) {
      setProperties(prev => 
        prev.map(property => 
          property.id === updatedProperty.id ? updatedProperty : property
        )
      );
      setEditingProperty(null);
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
              <PropertyActions />
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
