
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, FileText, Calendar, Search, Filter, Plus } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface CampaignTrackerProps {
  campaignId: string;
}

// Dummy contact data
const contactsData = [
  {
    id: "1",
    name: "John Doe",
    phone: "(555) 123-4567",
    email: "john.doe@example.com",
    status: "New",
    source: "Zillow",
    lastContact: "Never",
    hasEmail: true,
    hasPhone: true,
    hasSMS: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "(555) 987-6543",
    email: "jane.smith@example.com",
    status: "Contacted",
    source: "MLS",
    lastContact: "2023-06-10",
    hasEmail: true,
    hasPhone: true,
    hasSMS: true,
  },
  {
    id: "3",
    name: "Alice Johnson",
    phone: "(555) 555-5555",
    email: "alice.j@example.com",
    status: "Interested",
    source: "Referral",
    lastContact: "2023-06-08",
    hasEmail: true,
    hasPhone: true,
    hasSMS: false,
  },
  {
    id: "4",
    name: "Bob Williams",
    phone: "(555) 222-3333",
    email: "bob.w@example.com",
    status: "Not Interested",
    source: "Cold Call",
    lastContact: "2023-06-05",
    hasEmail: true,
    hasPhone: true,
    hasSMS: true,
  },
  {
    id: "5",
    name: "Carol Martinez",
    phone: "(555) 444-9999",
    email: "carol.m@example.com",
    status: "Appointment",
    source: "Website",
    lastContact: "2023-06-12",
    hasEmail: true,
    hasPhone: false,
    hasSMS: false,
  }
];

// Dummy activity log data
const activityLogData = [
  {
    id: "1",
    contactName: "John Doe",
    type: "Email",
    status: "Sent",
    date: "2023-06-10",
    subject: "Property Listing Opportunity",
    notes: "Initial contact email sent"
  },
  {
    id: "2",
    contactName: "Jane Smith",
    type: "Phone",
    status: "Completed",
    date: "2023-06-09",
    subject: "Introduction Call",
    notes: "Discussed listing options, interested in selling in next 3 months"
  },
  {
    id: "3",
    contactName: "Alice Johnson",
    type: "SMS",
    status: "Sent",
    date: "2023-06-08",
    subject: "Follow-up",
    notes: "Sent text reminder about upcoming open house"
  },
  {
    id: "4",
    contactName: "Bob Williams",
    type: "Letter",
    status: "Sent",
    date: "2023-06-07",
    subject: "Market Analysis",
    notes: "Mailed detailed market analysis for neighborhood"
  },
  {
    id: "5",
    contactName: "Jane Smith",
    type: "Email",
    status: "Opened",
    date: "2023-06-11",
    subject: "Property Valuation",
    notes: "Opened email, clicked on valuation link"
  }
];

export default function CampaignTracker({ campaignId }: CampaignTrackerProps) {
  const [contactSearch, setContactSearch] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  
  const form = useForm();

  // Get campaign details based on campaignId
  const campaignData = {
    id: campaignId,
    title: "Spring Sellers",
    description: "Campaign targeting spring sellers",
    type: "seller",
    contacts: 342,
    responses: 87,
    lastUpdated: "2023-06-12",
    status: "active",
    progress: 35,
  };
  
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
  
  const getActivityTypeIcon = (type: string) => {
    switch(type) {
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Phone': return <Phone className="h-4 w-4" />;
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'Letter': return <FileText className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  // Filter contacts based on search
  const filteredContacts = contactsData.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.phone.includes(contactSearch)
  );

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">Campaign Progress</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={campaignData.progress} className="w-60" />
            <span className="text-sm">{campaignData.progress}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit Campaign
          </Button>
          <Button size="sm">
            Run Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="contacts" onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4 mt-4">
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
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Contacted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {contact.hasEmail && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.hasPhone && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.hasSMS && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{contact.source}</TableCell>
                    <TableCell>{contact.lastContact}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedContact(contact.id)}>
                        Log Activity
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {selectedContact && (
            <div className="border rounded-md p-4 mt-4">
              <h3 className="text-lg font-medium mb-4">
                Log Activity for {contactsData.find(c => c.id === selectedContact)?.name}
              </h3>
              <Form {...form}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="activityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone Call</option>
                            <option value="sms">SMS</option>
                            <option value="letter">Letter</option>
                            <option value="meeting">Meeting</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="sent">Sent/Attempted</option>
                            <option value="received">Received/Completed</option>
                            <option value="interested">Interested</option>
                            <option value="not-interested">Not Interested</option>
                            <option value="followup">Requires Follow-up</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject/Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subject or topic" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter activity notes"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setSelectedContact(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Activity
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </TabsContent>
        
        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activity..."
                className="pl-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Activity
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
                {activityLogData.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell>{activity.date}</TableCell>
                    <TableCell className="font-medium">{activity.contactName}</TableCell>
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
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Methods</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Email</span>
                  <span className="font-medium">56%</span>
                </div>
                <Progress value={56} />
                
                <div className="flex justify-between items-center">
                  <span>Phone</span>
                  <span className="font-medium">28%</span>
                </div>
                <Progress value={28} />
                
                <div className="flex justify-between items-center">
                  <span>SMS</span>
                  <span className="font-medium">12%</span>
                </div>
                <Progress value={12} />
                
                <div className="flex justify-between items-center">
                  <span>Letter</span>
                  <span className="font-medium">4%</span>
                </div>
                <Progress value={4} />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Response Rates</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Email</span>
                  <span className="font-medium">23%</span>
                </div>
                <Progress value={23} />
                
                <div className="flex justify-between items-center">
                  <span>Phone</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} />
                
                <div className="flex justify-between items-center">
                  <span>SMS</span>
                  <span className="font-medium">38%</span>
                </div>
                <Progress value={38} />
                
                <div className="flex justify-between items-center">
                  <span>Letter</span>
                  <span className="font-medium">12%</span>
                </div>
                <Progress value={12} />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>New</span>
                  <span className="font-medium">30%</span>
                </div>
                <Progress value={30} />
                
                <div className="flex justify-between items-center">
                  <span>Contacted</span>
                  <span className="font-medium">40%</span>
                </div>
                <Progress value={40} />
                
                <div className="flex justify-between items-center">
                  <span>Interested</span>
                  <span className="font-medium">15%</span>
                </div>
                <Progress value={15} />
                
                <div className="flex justify-between items-center">
                  <span>Not Interested</span>
                  <span className="font-medium">10%</span>
                </div>
                <Progress value={10} />
                
                <div className="flex justify-between items-center">
                  <span>Appointment</span>
                  <span className="font-medium">5%</span>
                </div>
                <Progress value={5} />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4 mt-4">
            <h3 className="text-lg font-medium mb-4">Campaign Timeline</h3>
            <div className="h-60 flex items-center justify-center border rounded bg-muted/20">
              <p className="text-muted-foreground">Campaign timeline visualization would go here</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
