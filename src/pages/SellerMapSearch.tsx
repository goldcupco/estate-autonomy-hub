
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MapSearch } from '@/components/map/MapSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Home, DollarSign } from 'lucide-react';

// Sample data - in a real app, this would come from an API or context
const sampleSellerData = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, San Francisco, CA 94105",
    propertyType: "Single Family Home",
    askingPrice: 750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    status: "Active",
    location: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    propertyType: "Condo",
    askingPrice: 550000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    status: "Pending",
    location: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    phone: "(555) 456-7890",
    address: "789 Pine St, Seattle, WA 98101",
    propertyType: "Townhouse",
    askingPrice: 650000,
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 1600,
    status: "Active",
    location: { lat: 47.6062, lng: -122.3321 }
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "(555) 234-5678",
    address: "321 Cedar Rd, Chicago, IL 60007",
    propertyType: "Single Family Home",
    askingPrice: 420000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    status: "Active",
    location: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    phone: "(555) 876-5432",
    address: "567 Maple Dr, New York, NY 10001",
    propertyType: "Condo",
    askingPrice: 980000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: "Just Listed",
    location: { lat: 40.7128, lng: -74.0060 }
  }
];

export default function SellerMapSearch() {
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Just Listed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 py-8 animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Seller Map Search</h1>
        </div>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="details">Seller Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-6">
            <MapSearch 
              data={sampleSellerData} 
              contactType="seller" 
              onSelect={setSelectedSeller}
            />
          </TabsContent>
          
          <TabsContent value="details">
            {selectedSeller ? (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4">{selectedSeller.name}</h2>
                      
                      <Badge className={getStatusColor(selectedSeller.status)}>
                        {selectedSeller.status}
                      </Badge>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSeller.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSeller.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSeller.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Property Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedSeller.propertyType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(selectedSeller.askingPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="p-3 bg-muted rounded-md text-center">
                          <div className="font-medium">{selectedSeller.bedrooms}</div>
                          <div className="text-xs text-muted-foreground">Beds</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md text-center">
                          <div className="font-medium">{selectedSeller.bathrooms}</div>
                          <div className="text-xs text-muted-foreground">Baths</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md text-center">
                          <div className="font-medium">{selectedSeller.sqft.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Sq Ft</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Select a seller from the map to view details</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
