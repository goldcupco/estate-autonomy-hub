
import { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  User, 
  Calendar, 
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type CallDirection = 'incoming' | 'outgoing' | 'missed';
export type CallStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Call {
  id: string;
  contactName: string;
  contactPhone: string;
  direction: CallDirection;
  status: CallStatus;
  date: string;
  time: string;
  duration: number | null;
  notes: string;
}

const DEMO_CALLS: Call[] = [
  {
    id: '1',
    contactName: 'John Smith',
    contactPhone: '(555) 123-4567',
    direction: 'incoming',
    status: 'completed',
    date: '2025-03-12',
    time: '10:30',
    duration: 15,
    notes: 'Discussed property on 123 Main St.'
  },
  {
    id: '2',
    contactName: 'Sarah Johnson',
    contactPhone: '(555) 987-6543',
    direction: 'outgoing',
    status: 'completed',
    date: '2025-03-13',
    time: '14:45',
    duration: 8,
    notes: 'Called about listing their home.'
  },
  {
    id: '3',
    contactName: 'Michael Brown',
    contactPhone: '(555) 456-7890',
    direction: 'missed',
    status: 'cancelled',
    date: '2025-03-14',
    time: '09:15',
    duration: null,
    notes: 'Missed call, need to follow up.'
  },
  {
    id: '4',
    contactName: 'Emma Wilson',
    contactPhone: '(555) 234-5678',
    direction: 'outgoing',
    status: 'scheduled',
    date: '2025-03-16',
    time: '11:00',
    duration: null,
    notes: 'Scheduled to discuss financing options.'
  },
  {
    id: '5',
    contactName: 'David Lee',
    contactPhone: '(555) 876-5432',
    direction: 'incoming',
    status: 'completed',
    date: '2025-03-11',
    time: '13:20',
    duration: 23,
    notes: 'Called about property viewing.'
  },
  {
    id: '6',
    contactName: 'Jennifer Garcia',
    contactPhone: '(555) 345-6789',
    direction: 'outgoing',
    status: 'scheduled',
    date: '2025-03-17',
    time: '15:30',
    duration: null,
    notes: 'Scheduled call to discuss contract terms.'
  }
];

interface CallListProps {
  // Props can be added here if needed
}

export const CallList = ({}: CallListProps) => {
  const [calls, setCalls] = useState<Call[]>(DEMO_CALLS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(calls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCalls = calls.slice(startIndex, endIndex);
  
  const initialNewCall: Omit<Call, 'id'> = {
    contactName: '',
    contactPhone: '',
    direction: 'outgoing',
    status: 'scheduled',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration: null,
    notes: ''
  };
  
  const [newCall, setNewCall] = useState<Omit<Call, 'id'>>(initialNewCall);
  
  const resetForm = () => {
    setNewCall(initialNewCall);
    setEditingCall(null);
  };
  
  const openNewCallDialog = () => {
    resetForm();
    setDialogOpen(true);
  };
  
  const openEditCallDialog = (call: Call) => {
    setEditingCall(call);
    setNewCall(call);
    setDialogOpen(true);
  };
  
  const handleSaveCall = () => {
    if (!newCall.contactName || !newCall.contactPhone || !newCall.date || !newCall.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (editingCall) {
      // Update existing call
      setCalls(prevCalls => 
        prevCalls.map(call => 
          call.id === editingCall.id ? { ...newCall, id: call.id } : call
        )
      );
      toast({
        title: "Call updated",
        description: "The call has been updated successfully."
      });
    } else {
      // Add new call
      setCalls(prevCalls => [
        ...prevCalls, 
        { ...newCall, id: uuidv4() }
      ]);
      toast({
        title: "Call added",
        description: "New call has been added successfully."
      });
    }
    
    setDialogOpen(false);
    resetForm();
  };
  
  const handleDeleteCall = (id: string) => {
    setCalls(prevCalls => prevCalls.filter(call => call.id !== id));
    toast({
      title: "Call deleted",
      description: "The call has been removed."
    });
  };
  
  const getCallIcon = (direction: CallDirection) => {
    switch (direction) {
      case 'incoming': return <PhoneIncoming className="h-4 w-4 text-green-500" />;
      case 'outgoing': return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
      case 'missed': return <PhoneMissed className="h-4 w-4 text-red-500" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };
  
  const getStatusClass = (status: CallStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const formatDuration = (minutes: number | null) => {
    if (minutes === null) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
    }
  };
  
  const formatCallDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return `${date} ${time}`;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Call History</h2>
        <Button onClick={openNewCallDialog}>
          <Plus className="mr-2 h-4 w-4" /> 
          New Call
        </Button>
      </div>
      
      {calls.length > 0 ? (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{call.contactName}</p>
                        <p className="text-sm text-muted-foreground">{call.contactPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCallIcon(call.direction)}
                        <span className="capitalize">{call.direction}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(call.status)}`}>
                        {call.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCallDateTime(call.date, call.time)}</TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>
                      <p className="truncate max-w-[200px]">{call.notes}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCallDialog(call)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCall(call.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink 
                      isActive={currentPage === index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-12 border rounded-md">
          <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No calls yet</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first call record.</p>
          <Button onClick={openNewCallDialog}>Add a call</Button>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCall ? 'Edit Call' : 'Add New Call'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contactName" className="text-sm font-medium">
                  Contact Name*
                </label>
                <Input
                  id="contactName"
                  value={newCall.contactName}
                  onChange={(e) => setNewCall({ ...newCall, contactName: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contactPhone" className="text-sm font-medium">
                  Phone Number*
                </label>
                <Input
                  id="contactPhone"
                  value={newCall.contactPhone}
                  onChange={(e) => setNewCall({ ...newCall, contactPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="callDirection" className="text-sm font-medium">
                  Call Direction
                </label>
                <Select
                  value={newCall.direction}
                  onValueChange={(value) => setNewCall({ ...newCall, direction: value as CallDirection })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="callStatus" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={newCall.status}
                  onValueChange={(value) => setNewCall({ ...newCall, status: value as CallStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="callDate" className="text-sm font-medium">
                  Date*
                </label>
                <Input
                  id="callDate"
                  type="date"
                  value={newCall.date}
                  onChange={(e) => setNewCall({ ...newCall, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="callTime" className="text-sm font-medium">
                  Time*
                </label>
                <Input
                  id="callTime"
                  type="time"
                  value={newCall.time}
                  onChange={(e) => setNewCall({ ...newCall, time: e.target.value })}
                  required
                />
              </div>
            </div>
            
            {newCall.status === 'completed' && (
              <div className="space-y-2">
                <label htmlFor="callDuration" className="text-sm font-medium">
                  Duration (minutes)
                </label>
                <Input
                  id="callDuration"
                  type="number"
                  value={newCall.duration !== null ? newCall.duration.toString() : ''}
                  onChange={(e) => setNewCall({ 
                    ...newCall, 
                    duration: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Enter call duration in minutes"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="callNotes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="callNotes"
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                placeholder="Add call notes..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCall}>
              {editingCall ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallList;
