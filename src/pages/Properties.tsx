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

export const propertiesData = [
  {
    id: '1',
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    propertyType: 'House' as const,
  },
  {
    id: '2',
    address: '456 Oak Avenue',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    price: 625000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    status: 'Pending' as const,
    imageUrl: 'https://images.unsplash.com/photo-1598228723793-52759bba239c',
    propertyType: 'House' as const,
  },
  {
    id: '3',
    address: '789 Pine Lane',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    price: 380000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    status: 'Sold' as const,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    propertyType: 'House' as const,
  },
  {
    id: '4',
    address: '101 Lake Drive',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    price: 750000,
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 2800,
    status: 'Lead' as const,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
    propertyType: 'House' as const,
  },
  {
    id: '5',
    address: '222 Cedar Court',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    price: 520000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2100,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    propertyType: 'House' as const,
  },
  {
    id: '6',
    address: '333 Maple Road',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    price: 495000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1950,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
    propertyType: 'House' as const,
  },
  {
    id: '7',
    address: '444 Birch Street',
    city: 'Nashville',
    state: 'TN',
    zipCode: '37203',
    price: 410000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1750,
    status: 'Negotiating' as const,
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
    propertyType: 'House' as const,
  },
  {
    id: '8',
    address: '555 Elm Boulevard',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    price: 825000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2600,
    status: 'Pending' as const,
    imageUrl: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5',
    propertyType: 'House' as const,
  },
  {
    id: '9',
    address: '666 Willow Way',
    city: 'Boston',
    state: 'MA',
    zipCode: '02108',
    price: 710000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2200,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
    propertyType: 'House' as const,
  },
  {
    id: '10',
    address: '777 Cherry Lane',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30305',
    price: 390000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    status: 'Sold' as const,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    propertyType: 'House' as const,
  },
  {
    id: '11',
    address: '888 Aspen Court',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    price: 460000,
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2300,
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126',
    propertyType: 'House' as const,
  },
  {
    id: '12',
    address: '999 Sycamore Drive',
    city: 'Philadelphia',
    state: 'PA',
    zipCode: '19103',
    price: 575000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2100,
    status: 'Lead' as const,
    imageUrl: 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d',
    propertyType: 'House' as const,
  },
  {
    id: '13',
    address: 'Hillside Acres Lot 7',
    city: 'Bozeman',
    state: 'MT',
    zipCode: '59715',
    price: 320000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 5,  // 5 acres
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
    propertyType: 'Land' as const,
  },
  {
    id: '14',
    address: 'Riverside Plot B2',
    city: 'Sedona',
    state: 'AZ',
    zipCode: '86336',
    price: 275000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 2.5,  // 2.5 acres
    status: 'For Sale' as const,
    imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
    propertyType: 'Land' as const,
  },
  {
    id: '15',
    address: 'Mountain View Lot 12',
    city: 'Aspen',
    state: 'CO',
    zipCode: '81611',
    price: 1200000,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 10,  // 10 acres
    status: 'Pending' as const,
    imageUrl: 'https://images.unsplash.com/photo-1449452198679-05c7fd30f416',
    propertyType: 'Land' as const,
  }
];

export function Properties() {
  const navigate = useNavigate();
  const [showImporter, setShowImporter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
  
  const handleImportSuccess = (properties: any[]) => {
    toast.success(`Successfully imported ${properties.length} properties from MLS`);
    setShowImporter(false);
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
            
            <PropertyGrid 
              properties={propertiesData} 
              onPropertyClick={(id) => navigate(`/property/${id}`)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Properties;
