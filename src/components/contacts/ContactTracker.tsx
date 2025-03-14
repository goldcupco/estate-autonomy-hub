import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageSquare, FileText, Search, Filter, Plus, Calendar } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trackLetterSending } from '@/utils/communicationUtils';
import { useToast } from "@/hooks/use-toast";

interface ContactTrackerProps {
  contactId: string;
}

const getContactById = (id: string) => {
  const contacts = [
    {
      id: "1",
      name: "John Doe",
      type: "Seller",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      status: "New",
      source: "CSV Import",
      lastContact: "Never",
      notes: "Interested in selling in the next 3 months",
      property: "123 Main St, Anytown, CA",
      budget: null,
      preferences: null
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
      notes: "Looking for a 3-bedroom house in downtown area",
      property: null,
      budget: "$500,000 - $750,000",
      preferences: "3 bed, 2 bath, downtown area"
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
      notes: "Has a 4-bedroom property, moving out of state",
      property: "456 Oak Ave, Somecity, CA",
      budget: null,
      preferences: null
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
      notes: "Not looking to buy at this time",
      property: null,
      budget: "$350,000 - $450,000",
      preferences: "2 bed, rural area, large yard"
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
      notes: "Meeting scheduled for property evaluation",
      property: "789 Pine St, Anothercity, CA",
      budget: null,
      preferences: null
    }
  ];
  
  return contacts.find(c => c.id === id) || contacts[0];
};

const getContactActivities = (contactId: string) => {
  const activities = [
    {
      id: "1",
      contactId: "1",
      type: "Email",
      date: "2023-06-15",
      subject: "Introduction",
      notes: "Sent initial introduction email",
      status: "Sent",
      response: "None yet"
    },
    {
      id: "2",
      contactId: "1",
      type: "Phone",
      date: "2023-06-16",
      subject: "Follow-up Call",
      notes: "Called to discuss property details",
      status: "Completed",
      response: "Interested in selling, wants to meet"
    },
    {
      id: "3",
      contactId: "2",
      type: "SMS",
      date: "2023-06-14",
      subject: "Listing Notification",
      notes: "Sent text about new listings",
      status: "Sent",
      response: "Requested more information"
    },
    {
      id: "4",
      contactId: "3",
      type: "Letter",
      date: "2023-06-12",
      subject: "Market Analysis",
      notes: "Mailed market analysis for their neighborhood",
      status: "Sent",
      response: "None yet"
    },
    {
      id: "5",
      contactId: "5",
      type: "Email",
      date: "2023-06-11",
      subject: "Appointment Confirmation",
      notes: "Confirmed property evaluation appointment",
      status: "Opened",
      response: "Confirmed availability"
    },
    {
      id: "6",
      contactId: "1",
      type: "SMS",
      date: "2023-06-17",
      subject: "Appointment Reminder",
      notes: "Reminder for our meeting tomorrow",
      status: "Sent",
      response: "Confirmed attendance"
    }
  ];
  
  return activities.filter(a => a.contactId === contactId);
};

export default function ContactTracker({ contactId }: ContactTrackerProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [newActivityType, setNewActivityType] = useState("email");
  const [progress, setProgress] = useState(75);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [letterAddress, setLetterAddress] = useState('');
  const [letterTrackingNumber, setLetterTrackingNumber] = useState('');
  
  const form = useForm();
  const contact = getContactById(contactId);
  const activities = getContactActivities(contactId);
  const { toast: uiToast } = useToast();

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'interested': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'not interested': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'appointment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  const getActivityTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'letter': return <FileText className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleAddActivity = () => {
    const values = form.getValues();
    toast.success(`Activity logged: ${values.activityType || newActivityType} to ${contact.name}`);
    form.reset();
  };

  const handleSendLetter = () => {
    if (!letterContent) {
      uiToast({
        title: "Missing content",
        description: "Please enter letter content.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const letterRecord = trackLetterSending(
        contact.name,
        letterContent,
        letterAddress || undefined
      );
      
      setLetterTrackingNumber(letterRecord.trackingNumber || '');
      
      const newActivity = {
        id: Math.random().toString(),
        contactId,
        type: "Letter",
        date: new Date().toISOString().split('T')[0],
        subject: "Letter Communication",
        notes: `Letter sent: "${letterContent.substring(0, 50)}${letterContent.length > 50 ? '...' : ''}"`,
        status: "Sent",
        response: "Pending",
        trackingNumber: letterRecord.trackingNumber
      };
      
      uiToast({
        title: "Letter queued and tracked",
        description: `Letter to ${contact.name} has been queued. Tracking #: ${letterRecord.trackingNumber}`,
      });
    } catch (error) {
      console.error('Error tracking letter:', error);
      uiToast({
        title: "Error tracking letter",
        description: "Letter queued but could not be tracked",
        variant: "destructive"
      });
    }
    
    setIsLetterDialogOpen(false);
    setLetterContent('');
    setLetterAddress('');
  };

  return (
    <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">Engagement Score</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="w-60" />
            <span className="text-sm">{progress}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit Contact
          </Button>
          <Button size="sm">
            Add to Campaign
          </Button>
        </div>
      </div>

      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Letter for {contact.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="letterAddress" className="text-sm font-medium">
                  Mailing Address
                </label>
                <Input
                  id="letterAddress"
                  value={letterAddress}
                  onChange={(e) => setLetterAddress(e.target.value)}
                  placeholder="Enter recipient's mailing address"
                  className="mt-2"
                />
              </div>
              
              <div>
                <label htmlFor="letterContent" className="text-sm font-medium">
                  Letter Content
                </label>
                <Textarea
                  id="letterContent"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder="Type your letter content here..."
                  className="min-h-[200px] mt-2"
                />
              </div>
              
              {letterTrackingNumber && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm font-medium">Previous letter tracking number:</p>
                  <p className="text-sm font-mono">{letterTrackingNumber}</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsLetterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendLetter}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="details" onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="details">Contact Details</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
          <TabsTrigger value="log">Log Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Name:</span>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Type:</span>
                    <span>{contact.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Source:</span>
                    <span>{contact.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Contacted:</span>
                    <span>{contact.lastContact}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Email:</span>
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Phone:</span>
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {contact.type === 'Seller' ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Property Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Property:</span>
                      <span>{contact.property}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Buyer Information</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Budget:</span>
                      <span>{contact.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Preferences:</span>
                      <span>{contact.preferences}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">{contact.notes}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>SMS</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-100 border-amber-200"
                  onClick={() => setIsLetterDialogOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  <span>Letter</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4 mt-4">
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
              <Button size="sm" onClick={() => setActiveTab("log")}>
                <Plus className="h-4 w-4 mr-2" /> Log Activity
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getActivityTypeIcon(activity.type)}
                        <span>{activity.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{activity.subject}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{activity.notes}</TableCell>
                    <TableCell>{activity.status}</TableCell>
                    <TableCell>{activity.response}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="log" className="space-y-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddActivity)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onChange={(e) => {
                            field.onChange(e);
                            setNewActivityType(e.target.value);
                          }}
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
                        <Input type="date" {...field} defaultValue={new Date().toISOString().split('T')[0]} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
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
              
              <FormField
                control={form.control}
                name="response"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response/Outcome</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Enter the response or outcome (if any)"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("activity")}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Activity
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Communication Methods</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Email</span>
                  <span className="font-medium">50%</span>
                </div>
                <Progress value={50} />
                
                <div className="flex justify-between items-center">
                  <span>Phone</span>
                  <span className="font-medium">33%</span>
                </div>
                <Progress value={33} />
                
                <div className="flex justify-between items-center">
                  <span>SMS</span>
                  <span className="font-medium">17%</span>
                </div>
                <Progress value={17} />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Response Rate</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Email</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} />
                
                <div className="flex justify-between items-center">
                  <span>Phone</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} />
                
                <div className="flex justify-between items-center">
                  <span>SMS</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Timeline</h3>
            <div className="mt-4">
              <div className="relative">
                <div className="absolute h-full w-px bg-border left-2.5 top-0"></div>
                {activities.map((activity, index) => (
                  <div key={activity.id} className="ml-6 mb-4 relative">
                    <div className="absolute -left-6 mt-1.5 h-4 w-4 rounded-full border border-primary bg-background flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{activity.date}</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full text-xs">
                          {getActivityTypeIcon(activity.type)}
                          <span>{activity.type}</span>
                        </div>
                      </div>
                      <p className="text-sm">{activity.subject}</p>
                      <p className="text-xs text-muted-foreground">{activity.notes}</p>
                      <p className="text-xs text-muted-foreground">Response: {activity.response}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
