import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { PropertyImageGallery } from '@/components/property/PropertyImageGallery';
import { PropertyActivity } from '@/components/property/PropertyActivity';
import PropertyStreetView from '@/components/property/PropertyStreetView';
import PropertyMapView from '@/components/map/PropertyMapView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, MapPin, Info, PencilLine, Calendar, DollarSign, Users, Eye } from 'lucide-react';

const fetchProperty = async (id: string) => {
  return {
    id,
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    yearBuilt: 2018,
    description: 'Beautiful modern home in the heart of the city with stunning views and updated amenities.',
    propertyType: 'Single Family',
    status: 'Active',
    listedDate: '2023-04-15',
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg',
    ],
    features: [
      'Renovated Kitchen',
      'Hardwood Floors',
      'Central AC',
      'Fireplace',
      'Garage',
      'Backyard'
    ],
    agentName: 'John Smith',
    latitude: 37.7749,
    longitude: -122.4194
  };
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('details');
  
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id || '1'),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-20">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="h-40 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-20">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-2">Error Loading Property</h2>
            <p className="text-muted-foreground mb-4">Unable to load property details. Please try again later.</p>
            <Link to="/properties">
              <Button>Back to Properties</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);

  return (
    <Layout>
      <div className="container mx-auto py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link to="/properties">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Properties
                </Button>
              </Link>
              <Badge variant="outline" className="text-sm">
                {property.propertyType}
              </Badge>
              <Badge variant={property.status === 'Active' ? 'default' : 'secondary'} className="text-sm">
                {property.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{property.address}</h1>
            <p className="text-muted-foreground">
              {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formattedPrice}</div>
            <div className="text-muted-foreground text-sm">
              ${Math.round(property.price / property.squareFeet)}/sqft
            </div>
          </div>
        </div>

        <div className="mb-6">
          <PropertyImageGallery property={{ id: property.id, address: property.address, imageUrl: property.images[0] }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapPin className="h-4 w-4 mr-2" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="streetview">
                  <Eye className="h-4 w-4 mr-2" />
                  Street View
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Calendar className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Complete information about this property</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-2 border rounded-md">
                        <Home className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-medium">{property.bedrooms}</div>
                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-medium">{property.bathrooms}</div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-medium">{property.squareFeet}</div>
                        <div className="text-sm text-muted-foreground">Sq. Feet</div>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <PencilLine className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-medium">{property.yearBuilt}</div>
                        <div className="text-sm text-muted-foreground">Year Built</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{property.description}</p>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Features</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {property.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="h-2 w-2 bg-primary rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="map">
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                    <CardDescription>Property location on map</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PropertyMapView 
                      address={`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}
                      location={{ lat: property.latitude, lng: property.longitude }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="streetview">
                <Card>
                  <CardHeader>
                    <CardTitle>Street View</CardTitle>
                    <CardDescription>View the property from street level</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PropertyStreetView 
                      latitude={property.latitude} 
                      longitude={property.longitude} 
                      address={`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Activity</CardTitle>
                    <CardDescription>Recent updates and activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PropertyActivity propertyId={property.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Listed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                    {property.agentName.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{property.agentName}</div>
                    <div className="text-sm text-muted-foreground">Listing Agent</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="w-full mb-2">Contact Agent</Button>
                  <Button variant="outline" className="w-full">Schedule Viewing</Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <div className="flex justify-between py-1 border-b">
                    <span>Listed:</span>
                    <span>{property.listedDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>MLS#:</span>
                    <span>MLS-{property.id}12345</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
