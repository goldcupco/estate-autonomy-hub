
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataUploader } from '@/components/ui/DataUploader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import ContactTracker from '@/components/contacts/ContactTracker';
import { Search, Filter, Plus, Download, Upload, Users, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

export default function Contacts() {
  const [contactSearch, setContactSearch] = useState("");
  const [sellerData, setSellerData] = useState<any[] | null>(null);
  const [buyerData, setBuyerData] = useState<any[] | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  
  // Sample contact data
  const contactsData = [
    {
      id: "1",
      name: "John Doe",
      type: "Seller",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      status: "New",
      source: "CSV Import",
      lastContact: "Never",
      notes: "Interested in selling in the next 3 months"
    },
    {
      id: "2",
      name: "Jane Smith",
      type: "Buyer",
      email: "jane.smith@example.com",
      phone: "(555) 987-6543",
      status: "Contacted",
      source: "Website Lead",
      lastContact: "2023-06-10",
      notes: "Looking for a 3-bedroom house in downtown area"
    },
    {
      id: "3",
      name: "Alice Johnson",
      type: "Seller",
      email: "alice.j@example.com",
      phone: "(555) 555-5555",
      status: "Interested",
      source: "Referral",
      lastContact: "2023-06-08",
      notes: "Has a 4-bedroom property, moving out of state"
    },
    {
      id: "4",
      name: "Bob Williams",
      type: "Buyer",
      email: "bob.w@example.com",
      phone: "(555) 222-3333",
      status: "Not Interested",
      source: "Cold Call",
      lastContact: "2023-06-05",
      notes: "Not looking to buy at this time"
    },
    {
      id: "5",
      name: "Carol Martinez",
      type: "Seller",
      email: "carol.m@example.com",
      phone: "(555) 444-9999",
      status: "Appointment",
      source: "MLS Import",
      lastContact: "2023-06-12",
      notes: "Meeting scheduled for property evaluation"
    }
  ];
  
  // Contact activity history
  const contactActivities = [
    {
      id: "1",
      contactId: "1",
      type: "Email",
      date: "2023-06-15",
      subject: "Introduction",
      notes: "Sent initial introduction email",
      status: "Sent"
    },
    {
      id: "2",
      contactId: "2",
      type: "Phone",
      date: "2023-06-14",
      subject: "Property Inquiry",
      notes: "Discussed property requirements and budget",
      status: "Completed"
    },
    {
      id: "3",
      contactId: "3",
      type: "SMS",
      date: "2023-06-13",
      subject: "Follow-up",
      notes: "Sent text message to follow up on listing discussion",
      status: "Sent"
    },
    {
      id: "4",
      contactId: "4",
      type: "Letter",
      date: "2023-06-12",
      subject: "Market Update",
      notes: "Mailed quarterly market update",
      status: "Sent"
    },
    {
      id: "5",
      contactId: "5",
      type: "Email",
      date: "2023-06-11",
      subject: "Appointment Confirmation",
      notes: "Confirmed property evaluation appointment",
      status: "Opened"
    }
  ];

  const handleSellerUploadComplete = (data: any[]) => {
    setSellerData(data);
    toast(`Successfully imported ${data.length} seller records.`);
  };

  const handleBuyerUploadComplete = (data: any[]) => {
    setBuyerData(data);
    toast(`Successfully imported ${data.length} buyer records.`);
  };

  // Filter contacts based on search and type
  const filterContacts = (type: string) => {
    let filtered = contactsData;
    
    // Filter by search term
    if (contactSearch) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
        contact.phone.includes(contactSearch)
      );
    }
    
    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(contact => contact.type.toLowerCase() === type.toLowerCase());
    }
    
    return filtered;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Interested': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Not Interested': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Appointment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Get activity type icon
  const getActivityTypeIcon = (type: string) => {
    switch(type) {
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Phone': return <Phone className="h-4 w-4" />;
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'Letter': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Contact Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Contacts</TabsTrigger>
          <TabsTrigger value="seller">Sellers</TabsTrigger>
          <TabsTrigger value="buyer">Buyers</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="import">Import Contacts</TabsTrigger>
        </TabsList>
        
        {/* All Contacts Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Contact
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterContacts('all').map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>{contact.lastContact}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact.id)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                          <DialogHeader>
                            <DialogTitle>{contact.name}</DialogTitle>
                            <DialogDescription>
                              {contact.type} • {contact.status} • {contact.source}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedContact && <ContactTracker contactId={selectedContact} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Sellers Tab */}
        <TabsContent value="seller" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sellers..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Seller
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterContacts('seller').map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>{contact.lastContact}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact.id)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                          <DialogHeader>
                            <DialogTitle>{contact.name}</DialogTitle>
                            <DialogDescription>
                              {contact.type} • {contact.status} • {contact.source}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedContact && <ContactTracker contactId={selectedContact} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Buyers Tab */}
        <TabsContent value="buyer" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyers..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Buyer
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterContacts('buyer').map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{contact.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>{contact.lastContact}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact.id)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[900px]">
                          <DialogHeader>
                            <DialogTitle>{contact.name}</DialogTitle>
                            <DialogDescription>
                              {contact.type} • {contact.status} • {contact.source}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedContact && <ContactTracker contactId={selectedContact} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Log Activity
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactActivities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell>{activity.date}</TableCell>
                    <TableCell className="font-medium">
                      {contactsData.find(c => c.id === activity.contactId)?.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getActivityTypeIcon(activity.type)}
                        <span>{activity.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{activity.subject}</TableCell>
                    <TableCell>{activity.status}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{activity.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Import Contacts Tab */}
        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Import Seller Contacts
                </CardTitle>
                <CardDescription>
                  Import a CSV file containing seller information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Seller Data"
                  description="CSV file should include name, contact, property details"
                  onUploadComplete={handleSellerUploadComplete}
                />
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  For best results, include columns for name, address, phone, email and property details.
                </p>
              </CardFooter>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Import Buyer Contacts
                </CardTitle>
                <CardDescription>
                  Import a CSV file containing buyer information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader 
                  title="Upload Buyer Data"
                  description="CSV file should include name, contact, preferences"
                  onUploadComplete={handleBuyerUploadComplete}
                />
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  For best results, include columns for name, contact information, budget, and property preferences.
                </p>
              </CardFooter>
            </Card>
          </div>
          
          {/* Preview of Uploaded Data */}
          {(sellerData || buyerData) && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Uploaded Data Preview</CardTitle>
                <CardDescription>
                  {sellerData ? `${sellerData.length} seller records` : ''} 
                  {sellerData && buyerData ? ' and ' : ''}
                  {buyerData ? `${buyerData.length} buyer records` : ''} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {sellerData && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Seller Data:</h3>
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                        {JSON.stringify(sellerData.slice(0, 5), null, 2)}
                        {sellerData.length > 5 && <div className="text-center mt-2">... and {sellerData.length - 5} more records</div>}
                      </pre>
                    </div>
                  )}
                  
                  {buyerData && (
                    <div>
                      <h3 className="font-medium mb-2">Buyer Data:</h3>
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                        {JSON.stringify(buyerData.slice(0, 5), null, 2)}
                        {buyerData.length > 5 && <div className="text-center mt-2">... and {buyerData.length - 5} more records</div>}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button variant="outline">Cancel</Button>
                <Button>Add to Contacts</Button>
                <Button>Create Campaign</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
