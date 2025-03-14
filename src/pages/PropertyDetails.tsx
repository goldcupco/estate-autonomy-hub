
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Building, 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  MessageSquare,
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PropertyActivity } from '@/components/property/PropertyActivity';
import { PropertyImageGallery } from '@/components/property/PropertyImageGallery';
import { PropertyMapView } from '@/components/map/PropertyMapView';

import { propertiesData } from './Properties';

const propertiesWithCoordinates = propertiesData.map(property => {
  let coordinates;
  switch(property.id) {
    case '1':
      coordinates = { lat: 30.267153, lng: -97.743057 };
      break;
    case '2':
      coordinates = { lat: 39.742043, lng: -104.991531 };
      break;
    case '3':
      coordinates = { lat: 25.761681, lng: -80.191788 };
      break;
    case '4':
      coordinates = { lat: 47.606209, lng: -122.332071 };
      break;
    case '5':
      coordinates = { lat: 41.878113, lng: -87.629799 };
      break;
    case '6':
      coordinates = { lat: 45.523064, lng: -122.676483 };
      break;
    case '7':
      coordinates = { lat: 36.162664, lng: -86.781602 };
      break;
    case '8':
      coordinates = { lat: 32.715736, lng: -117.161087 };
      break;
    case '9':
      coordinates = { lat: 42.360082, lng: -71.058880 };
      break;
    case '10':
      coordinates = { lat: 33.748997, lng: -84.387985 };
      break;
    case '11':
      coordinates = { lat: 33.448376, lng: -112.074036 };
      break;
    case '12':
      coordinates = { lat: 39.952583, lng: -75.165222 };
      break;
    case '13':
      coordinates = { lat: 45.676998, lng: -111.042934 };
      break;
    case '14':
      coordinates = { lat: 34.869740, lng: -111.760990 };
      break;
    case '15':
      coordinates = { lat: 39.191097, lng: -106.817535 };
      break;
    default:
      coordinates = { lat: 34.0522, lng: -118.2437 };
  }
  
  return {
    ...property,
    coordinates
  };
});

export function PropertyDetails() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [emailOpen, setEmailOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [callLogOpen, setCallLogOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  const property = propertiesWithCoordinates.find(p => p.id === id);

  if (!property) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-4">Property Not Found</h1>
        </div>
        <p>The property you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'For Sale':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Sold':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Lead':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Negotiating':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleSendSMS = (message: string, recipient: string) => {
    toast({
      title: "SMS Sent",
      description: `Message sent to ${recipient}`,
    });
    setSmsOpen(false);
  };

  const handleSendEmail = (subject: string, message: string, recipient: string) => {
    toast({
      title: "Email Sent",
      description: `Email sent to ${recipient}`,
    });
    setEmailOpen(false);
  };

  const handleLogCall = (notes: string, duration: string) => {
    toast({
      title: "Call Logged",
      description: `Call activity recorded`,
    });
    setCallLogOpen(false);
  };

  const handleSendContract = (contractType: string, recipient: string) => {
    toast({
      title: "Contract Sent",
      description: `${contractType} sent to ${recipient}`,
    });
    setContractOpen(false);
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate('/properties')} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{property.address}</h1>
        </div>
        <Badge className={getStatusStyles(property.status)} variant="outline">
          {property.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input type="email" placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="About the property at 123 Main St" defaultValue={`Property Details: ${property.address}`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Type your message here" 
                  rows={5} 
                  defaultValue={`Here are the details for ${property.address}, ${property.city}, ${property.state} ${property.zipCode}.\n\nPrice: ${formattedPrice}\nBedrooms: ${property.bedrooms}\nBathrooms: ${property.bathrooms}\nSquare Feet: ${property.sqft}`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSendEmail("Property Details", "Message content", "client@example.com")}>Send Email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>SMS</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send SMS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Input type="tel" placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Type your message here" 
                  rows={3} 
                  defaultValue={`Details for ${property.address} (${formattedPrice}): ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.sqft} sqft. Let me know if you'd like to schedule a viewing.`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSmsOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSendSMS("Message content", "(555) 123-4567")}>Send SMS</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={callLogOpen} onOpenChange={setCallLogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Call</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact</label>
                <Input type="text" placeholder="Client Name" defaultValue="Client" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input type="tel" placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input type="text" placeholder="5 minutes" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea placeholder="What was discussed?" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCallLogOpen(false)}>Cancel</Button>
              <Button onClick={() => handleLogCall("Call notes", "5 minutes")}>Log Call</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={contractOpen} onOpenChange={setContractOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Send Contract</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contract Type</label>
                <select className="w-full rounded-md border border-input bg-background p-2">
                  <option value="listing">Listing Agreement</option>
                  <option value="sale">Sales Contract</option>
                  <option value="lease">Lease Agreement</option>
                  <option value="disclosure">Seller's Disclosure</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Email</label>
                <Input type="email" placeholder="client@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Additional notes for this contract" 
                  rows={3} 
                  defaultValue={`Please review and sign the attached contract for the property at ${property.address}.`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContractOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSendContract("Sales Contract", "client@example.com")}>Send Contract</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Schedule</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-md">
              <PropertyImageGallery property={property} />
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="maps">Maps</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">{formattedPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold">{property.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Square Feet</p>
                      <p className="font-semibold">{property.sqft.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold">Residential</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year Built</p>
                      <p className="font-semibold">2018</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lot Size</p>
                      <p className="font-semibold">0.25 acres</p>
                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground">
                      Beautiful property located in a prime area of {property.city}. This {property.bedrooms} bedroom, {property.bathrooms} bathroom home offers {property.sqft.toLocaleString()} square feet of living space with modern amenities and finishes. The property features an open floor plan, hardwood floors, updated kitchen, and spacious backyard.
                    </p>
                  </div>

                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      {property.address}<br />
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                    <div className="h-64 w-full bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Map View</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="maps">
              <Card>
                <CardContent className="pt-6">
                  {property.coordinates && (
                    <PropertyMapView 
                      address={`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}
                      location={property.coordinates}
                      height="500px"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardContent className="pt-6">
                  <PropertyActivity propertyId={property.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Documents</h3>
                      <Button size="sm" variant="outline">Upload</Button>
                    </div>
                    
                    <div className="rounded-md border">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Listing Agreement</p>
                            <p className="text-sm text-muted-foreground">Added May 12, 2023</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">View</Button>
                          <Button size="sm" variant="ghost">Download</Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Property Disclosure</p>
                            <p className="text-sm text-muted-foreground">Added May 15, 2023</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost">View</Button>
                          <Button size="sm" variant="ghost">Download</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Client Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Client Name</p>
                <p>John Smith</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p>john.smith@example.com</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p>(555) 123-4567</p>
              </div>
              <Button className="w-full" variant="outline">Edit Client Details</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Email Sent</p>
                      <p className="text-sm text-muted-foreground">Sent a property details email to client</p>
                      <p className="text-xs text-muted-foreground mt-1">Today, 2:30 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="min-w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Call Completed</p>
                      <p className="text-sm text-muted-foreground">5 minute call with John Smith</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday, 11:20 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="min-w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Contract Updated</p>
                      <p className="text-sm text-muted-foreground">Updated sales contract terms</p>
                      <p className="text-xs text-muted-foreground mt-1">June 10, 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="min-w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">SMS Sent</p>
                      <p className="text-sm text-muted-foreground">Sent showing confirmation message</p>
                      <p className="text-xs text-muted-foreground mt-1">June 8, 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="min-w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Showing Scheduled</p>
                      <p className="text-sm text-muted-foreground">Property showing scheduled with client</p>
                      <p className="text-xs text-muted-foreground mt-1">June 5, 2023</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetails;
