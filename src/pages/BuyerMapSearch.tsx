
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MapSearch } from '@/components/map/MapSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Home, DollarSign, Briefcase } from 'lucide-react';

// Sample data - in a real app, this would come from an API or context
const sampleBuyerData = [
  {
    id: "1",
    name: "Sarah Thompson",
    email: "sarah@example.com",
    phone: "(555) 111-2222",
    address: "789 First Ave, San Francisco, CA 94105",
    occupation: "Software Engineer",
    priceRange: { min: 500000, max: 750000 },
    preferredBedrooms: "2-3",
    preferredBathrooms: "2+",
    preferredAreas: ["South of Market", "Mission Bay", "Dogpatch"],
    status: "Active",
    location: { lat: 37.7839, lng: -122.3988 }
  },
  {
    id: "2",
    name: "David Garcia",
    email: "david@example.com",
    phone: "(555) 333-4444",
    address: "456 Second St, Los Angeles, CA 90001",
    occupation: "Doctor",
    priceRange: { min: 800000, max: 1200000 },
    preferredBedrooms: "3-4",
    preferredBathrooms: "3+",
    preferredAreas: ["Beverly Hills", "Santa Monica", "Brentwood"],
    status: "Pre-Approved",
    location: { lat: 34.0420, lng: -118.2513 }
  },
  {
    id: "3",
    name: "Jennifer Miller",
    email: "jennifer@example.com",
    phone: "(555) 555-6666",
    address: "123 Third Rd, Seattle, WA 98101",
    occupation: "Marketing Director",
    priceRange: { min: 400000, max: 600000 },
    preferredBedrooms: "2",
    preferredBathrooms: "1-2",
    preferredAreas: ["Capitol Hill", "Queen Anne", "Fremont"],
    status: "Active",
    location: { lat: 47.6102, lng: -122.3426 }
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james@example.com",
    phone: "(555) 777-8888",
    address: "890 Fourth Blvd, Chicago, IL 60007",
    occupation: "Financial Analyst",
    priceRange: { min: 350000, max: 550000 },
    preferredBedrooms: "2-3",
    preferredBathrooms: "1+",
    preferredAreas: ["Lincoln Park", "Lakeview", "Wicker Park"],
    status: "Just Started",
    location: { lat: 41.8759, lng: -87.6189 }
  },
  {
    id: "5",
    name: "Patricia Brown",
    email: "patricia@example.com",
    phone: "(555) 999-0000",
    address: "567 Fifth Lane, New York, NY 10001",
    occupation: "Attorney",
    priceRange: { min: 900000, max: 1500000 },
    preferredBedrooms: "3+",
    preferredBathrooms: "2+",
    preferredAreas: ["Upper East Side", "Chelsea", "Greenwich Village"],
    status: "Pre-Approved",
    location: { lat: 40.7415, lng: -73.9890 }
  }
];

export default function BuyerMapSearch() {
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pre-Approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Just Started': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Format price range
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Layout>
      <div className="space-y-6 py-8 animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Buyer Map Search</h1>
        </div>
        
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="details">Buyer Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-6">
            <MapSearch 
              data={sampleBuyerData} 
              contactType="buyer" 
              onSelect={setSelectedBuyer}
            />
          </TabsContent>
          
          <TabsContent value="details">
            {selectedBuyer ? (
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4">{selectedBuyer.name}</h2>
                      
                      <Badge className={getStatusColor(selectedBuyer.status)}>
                        {selectedBuyer.status}
                      </Badge>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBuyer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBuyer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBuyer.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedBuyer.occupation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Property Preferences</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Price Range: {formatPrice(selectedBuyer.priceRange.min)} - {formatPrice(selectedBuyer.priceRange.max)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>Bedrooms: {selectedBuyer.preferredBedrooms}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>Bathrooms: {selectedBuyer.preferredBathrooms}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Preferred Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBuyer.preferredAreas.map((area: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-muted">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">Select a buyer from the map to view details</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
