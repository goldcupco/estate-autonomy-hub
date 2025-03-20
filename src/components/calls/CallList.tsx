import { useState, useEffect } from 'react';
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
  Plus,
  MessageSquare,
  Mic,
  MicOff,
  FileText
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
  DialogDescription,
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
import { Badge } from '@/components/ui/badge';
import { 
  startCallRecording, 
  endCallRecording, 
  logSmsMessage,
  getSmsHistory,
  SmsRecord
} from '@/utils/communicationUtils';
import { supabase } from '@/integrations/supabase/client';
import { DbCallRecord } from '@/utils/supabaseClient';

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
  recordingUrl?: string;
  isRecorded?: boolean;
}

const mapCallRecordToCall = (record: DbCallRecord): Call => {
  const timestamp = new Date(record.timestamp);
  const date = timestamp.toISOString().split('T')[0];
  const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  let direction: CallDirection = 'outgoing';
  
  if (record.provider_type === 'twilio') {
    direction = 'outgoing';
  }
  
  return {
    id: record.id,
    contactName: record.contact_name,
    contactPhone: record.phone_number,
    direction: direction,
    status: 'completed',
    date,
    time,
    duration: record.duration || null,
    notes: record.notes || '',
    recordingUrl: record.recording_url,
    isRecorded: !!record.recording_url
  };
};

interface CallListProps {
  // Props can be added here if needed
}

export const CallList = ({}: CallListProps) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [smsText, setSmsText] = useState('');
  const [smsRecipient, setSmsRecipient] = useState<Call | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<number | null>(null);
  const [smsHistoryDialogOpen, setSmsHistoryDialogOpen] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SmsRecord[]>([]);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [letterText, setLetterText] = useState('');
  const [letterRecipient, setLetterRecipient] = useState<Call | null>(null);
  const [letterAddress, setLetterAddress] = useState('');
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
    notes: '',
    isRecorded: false
  };
  
  const [newCall, setNewCall] = useState<Omit<Call, 'id'>>(initialNewCall);

  useEffect(() => {
    const fetchCallRecords = async () => {
      setIsLoading(true);
      try {
        const userId = 'system';
        
        const { data, error } = await supabase
          .from('call_records')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const mappedCalls = data.map(record => mapCallRecordToCall(record as DbCallRecord));
          setCalls(mappedCalls);
        }
      } catch (error) {
        console.error('Error fetching call records:', error);
        toast({
          title: "Failed to load calls",
          description: "There was an error loading your call history.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCallRecords();
  }, []);

  useEffect(() => {
    if (isRecording && callStartTime) {
      const intervalId = window.setInterval(() => {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
      
      setCallTimerInterval(intervalId);
      
      return () => {
        window.clearInterval(intervalId);
      };
    } else if (callTimerInterval) {
      window.clearInterval(callTimerInterval);
      setCallTimerInterval(null);
    }
  }, [isRecording, callStartTime]);

  const formatCallDuration = (seconds: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
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

  const toggleCallRecording = () => {
    if (isRecording) {
      if (currentCallId && callStartTime) {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        try {
          const callRecord = endCallRecording(currentCallId, duration);
          
          if (editingCall) {
            setNewCall({
              ...newCall,
              isRecorded: true,
              recordingUrl: callRecord.recordingUrl,
              notes: newCall.notes + `\nCall recorded (${duration} seconds). Recording: ${callRecord.recordingUrl}`
            });
          }
          
          toast({
            title: "Call recorded",
            description: `Call recording saved (${formatCallDuration(duration)})`,
          });
        } catch (error) {
          console.error('Error ending call recording:', error);
        }
      }
      setIsRecording(false);
      setCurrentCallId(null);
      setCallStartTime(null);
      setCallDuration(0);
    } else {
      if (!editingCall && !newCall.contactPhone) {
        toast({
          title: "Missing information",
          description: "Please enter a contact phone number to record.",
          variant: "destructive"
        });
        return;
      }
      
      const phoneNumber = editingCall ? editingCall.contactPhone : newCall.contactPhone;
      const contactName = editingCall ? editingCall.contactName : newCall.contactName;
      
      try {
        const callId = startCallRecording(phoneNumber, contactName);
        setCurrentCallId(callId);
        setCallStartTime(new Date());
        setIsRecording(true);
        
        toast({
          title: "Recording started",
          description: `Recording call with ${contactName}`,
        });
      } catch (error) {
        console.error('Error starting call recording:', error);
        toast({
          title: "Recording failed",
          description: "Failed to start call recording",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleMakeCall = (call: Call) => {
    window.location.href = `tel:${call.contactPhone}`;
    
    toast({
      title: "Initiating call",
      description: `Calling ${call.contactName} at ${call.contactPhone}`,
    });
    
    const newOutgoingCall: Call = {
      id: uuidv4(),
      contactName: call.contactName,
      contactPhone: call.contactPhone,
      direction: 'outgoing',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      duration: 0,
      notes: 'Call initiated from call management screen',
      isRecorded: false
    };
    
    setCalls(prev => [newOutgoingCall, ...prev]);
  };
  
  const openSmsDialog = (call: Call) => {
    setSmsRecipient(call);
    setSmsText('');
    setSmsDialogOpen(true);
  };

  const handleViewSmsHistory = (call: Call) => {
    const history = getSmsHistory(call.contactPhone);
    setSmsHistory(history);
    setSmsHistoryDialogOpen(true);
  };
  
  const handleSendSms = () => {
    if (!smsRecipient || !smsText) {
      toast({
        title: "Missing information",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const smsRecord = logSmsMessage(
        smsRecipient.contactPhone, 
        smsText, 
        'outgoing',
        smsRecipient.contactName
      );
      
      setCalls(prev => prev.map(call => {
        if (call.id === smsRecipient.id) {
          return {
            ...call,
            notes: `${call.notes}\n[SMS sent]: ${smsText.substring(0, 50)}${smsText.length > 50 ? '...' : ''}`
          };
        }
        return call;
      }));
      
      toast({
        title: "SMS sent and logged",
        description: `Message sent to ${smsRecipient.contactName}`,
      });
    } catch (error) {
      console.error('Error logging SMS:', error);
      toast({
        title: "Error logging SMS",
        description: "Failed to send SMS",
        variant: "destructive"
      });
    }
    
    setSmsDialogOpen(false);
  };

  const openLetterDialog = (call: Call) => {
    setLetterRecipient(call);
    setLetterText('');
    setLetterAddress('');
    setLetterDialogOpen(true);
  };
  
  const handleSendLetter = () => {
    if (!letterRecipient || !letterText) {
      toast({
        title: "Missing information",
        description: "Please enter letter content.",
        variant: "destructive"
      });
      return;
    }
    
    const trackingNumber = `LTR-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setCalls(prev => prev.map(call => {
      if (call.id === letterRecipient.id) {
        return {
          ...call,
          notes: `${call.notes}\n[Letter sent]: To ${letterRecipient.contactName}${letterAddress ? ` at ${letterAddress}` : ''}. Tracking #: ${trackingNumber}`
        };
      }
      return call;
    }));
    
    toast({
      title: "Letter queued",
      description: `Letter to ${letterRecipient.contactName} has been queued for sending. Tracking #: ${trackingNumber}`,
    });
    
    setLetterDialogOpen(false);
  };
  
  const handleSaveCall = async () => {
    if (!newCall.contactName || !newCall.contactPhone || !newCall.date || !newCall.time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const callToSave = editingCall 
      ? { ...newCall, id: editingCall.id } 
      : { ...newCall, id: uuidv4() };
    
    if (editingCall) {
      setCalls(prevCalls => 
        prevCalls.map(call => 
          call.id === editingCall.id ? callToSave : call
        )
      );
      toast({
        title: "Call updated",
        description: "The call has been updated successfully."
      });
    } else {
      setCalls(prevCalls => [
        callToSave,
        ...prevCalls
      ]);
      toast({
        title: "Call added",
        description: "New call has been added successfully."
      });
    }
    
    await saveCallToDatabase(callToSave);
    
    setDialogOpen(false);
    resetForm();
    setIsRecording(false);
    setCurrentCallId(null);
    setCallStartTime(null);
    setCallDuration(0);
  };
  
  const handleDeleteCall = async (id: string) => {
    await deleteCallFromDatabase(id);
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
  
  const saveCallToDatabase = async (call: Call) => {
    try {
      const userId = 'system';
      
      const callRecord = {
        user_id: userId,
        provider_id: 'manual',
        provider_type: 'local',
        call_id: call.id,
        phone_number: call.contactPhone,
        contact_name: call.contactName,
        timestamp: new Date(`${call.date}T${call.time}`).toISOString(),
        duration: call.duration || 0,
        notes: call.notes,
        recording_url: call.recordingUrl
      };
      
      const { error } = await supabase
        .from('call_records')
        .upsert([callRecord]);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Call saved",
        description: "Call record has been saved to the database."
      });
      
      const { data, error: fetchError } = await supabase
        .from('call_records')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (data) {
        const mappedCalls = data.map(record => mapCallRecordToCall(record as DbCallRecord));
        setCalls(mappedCalls);
      }
      
    } catch (error) {
      console.error('Error saving call to database:', error);
      toast({
        title: "Failed to save call",
        description: "There was an error saving the call record.",
        variant: "destructive"
      });
    }
  };

  const deleteCallFromDatabase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('call_records')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setCalls(prevCalls => prevCalls.filter(call => call.id !== id));
      
      toast({
        title: "Call deleted",
        description: "Call record has been removed from the database."
      });
    } catch (error) {
      console.error('Error deleting call from database:', error);
      toast({
        title: "Failed to delete call",
        description: "There was an error removing the call record.",
        variant: "destructive"
      });
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
      
      {isLoading ? (
        <div className="text-center py-12 border rounded-md">
          <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-lg font-medium mb-2">Loading calls...</h3>
        </div>
      ) : calls.length > 0 ? (
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
                        {call.isRecorded && (
                          <Badge variant="outline" className="ml-1 text-red-500 border-red-200">Recorded</Badge>
                        )}
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
                          onClick={() => handleMakeCall(call)}
                          title="Call"
                        >
                          <Phone className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Call</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openSmsDialog(call)}
                          title="Send SMS"
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">SMS</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSmsHistory(call)}
                          title="View SMS History"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="sr-only">SMS History</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openLetterDialog(call)}
                          title="Send Letter"
                        >
                          <FileText className="h-4 w-4 text-amber-500" />
                          <span className="sr-only">Letter</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditCallDialog(call)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCall(call.id)}
                          title="Delete"
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
      
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!isRecording || !open) {
          setDialogOpen(open);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCall ? 'Edit Call' : 'Add New Call'}</DialogTitle>
            <DialogDescription>
              Calls can be recorded for quality and training purposes.
            </DialogDescription>
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
                  disabled={isRecording}
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
                  disabled={isRecording}
                />
              </div>
            </div>
            
            {isRecording && (
              <div className="p-3 border rounded-md bg-red-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="font-medium text-red-700">Recording: {formatCallDuration(callDuration)}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="callDirection" className="text-sm font-medium">
                  Call Direction
                </label>
                <Select
                  value={newCall.direction}
                  onValueChange={(value) => setNewCall({ ...newCall, direction: value as CallDirection })}
                  disabled={isRecording}
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
                  disabled={isRecording}
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
                  disabled={isRecording}
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
                  disabled={isRecording}
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
                  disabled={isRecording}
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
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant={isRecording ? "destructive" : "outline"} 
              onClick={toggleCallRecording}
              className="gap-1 sm:mr-auto"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Record Call"}
            </Button>
            
            <div className="flex gap-2">
              {!isRecording && (
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSaveCall} disabled={isRecording}>
                {editingCall ? 'Update' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={smsDialogOpen} onOpenChange={setSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
            <DialogDescription>
              SMS messages are logged for future reference.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {smsRecipient && (
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{smsRecipient.contactName}</p>
                  <p className="text-sm text-muted-foreground">{smsRecipient.contactPhone}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="smsText" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="smsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => handleViewSmsHistory(smsRecipient!)}>
              View History
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSmsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendSms}>
                Send Message
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={smsHistoryDialogOpen} onOpenChange={setSmsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>SMS History</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {smsHistory.length > 0 ? (
              <div className="space-y-4">
                {smsHistory.map((sms) => (
                  <div 
                    key={sms.id} 
                    className={`p-3 rounded-lg ${
                      sms.direction === 'outgoing' 
                        ? 'bg-blue-100 ml-8' 
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant={sms.direction === 'outgoing' ? 'default' : 'outline'}>
                        {sms.direction === 'outgoing' ? 'Sent' : 'Received'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sms.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{sms.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No SMS history found for this contact.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setSmsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Send Letter</DialogTitle>
            <DialogDescription>
              Letters are tracked with a tracking number.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {letterRecipient && (
              <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50 mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{letterRecipient.contactName}</p>
                  <p className="text-sm text-muted-foreground">{letterRecipient.contactPhone}</p>
                </div>
              </div>
            )}
            
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
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  placeholder="Type your letter content here..."
                  className="min-h-[200px] mt-2"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>
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
    </div>
  );
};

export default CallList;
