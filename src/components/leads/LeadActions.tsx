import { useState } from 'react';
import { Pencil, Trash2, MessageSquare, Phone, Mail, FileText, Mic, MicOff } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Lead, Note } from './LeadTable';
import { useToast } from "@/hooks/use-toast";
import { LeadForm } from './LeadForm';
import { LeadNotes } from './LeadNotes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  startCallRecording, 
  endCallRecording, 
  logSmsMessage,
  trackLetterSending,
  getSmsHistory,
  SmsRecord
} from '@/utils/communicationUtils';

interface LeadActionsProps {
  lead: Lead;
  onEdit: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function LeadActions({ lead, onEdit, onDelete, onAddNote }: LeadActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [isSmsHistoryDialogOpen, setIsSmsHistoryDialogOpen] = useState(false);
  const [smsText, setSmsText] = useState('');
  const [letterText, setLetterText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [smsHistory, setSmsHistory] = useState<SmsRecord[]>([]);
  const [letterAddress, setLetterAddress] = useState('');
  const [letterTrackingNumber, setLetterTrackingNumber] = useState('');
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(lead.id);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Lead deleted",
      description: `${lead.name} has been removed from your leads.`,
    });
  };

  const toggleCallRecording = () => {
    if (isRecording) {
      // Stop recording
      if (currentCallId && callStartTime) {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        try {
          const callRecord = endCallRecording(currentCallId, duration);
          
          // Add a note about the recorded call
          onAddNote(lead.id, {
            text: `Recorded call (${duration} seconds). Recording URL: ${callRecord.recordingUrl}`,
            type: 'call',
            timestamp: new Date().toISOString()
          });
          
          toast({
            title: "Call recorded",
            description: `Call with ${lead.name} recorded (${duration} seconds)`,
          });
        } catch (error) {
          console.error('Error ending call recording:', error);
        }
      }
      setIsRecording(false);
      setCurrentCallId(null);
      setCallStartTime(null);
    } else {
      // Start recording
      try {
        const callId = startCallRecording(lead.phone || '', lead.name);
        setCurrentCallId(callId);
        setCallStartTime(new Date());
        setIsRecording(true);
        
        toast({
          title: "Recording started",
          description: `Recording call with ${lead.name}`,
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

  const handleCall = () => {
    // In a real app, this would integrate with a phone API
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
      
      // Add a note for the call
      onAddNote(lead.id, {
        text: `Phone call initiated`,
        type: 'call',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Initiating call",
        description: `Calling ${lead.name} at ${lead.phone}`,
      });
    } else {
      toast({
        title: "Missing phone number",
        description: "This lead doesn't have a phone number.",
        variant: "destructive"
      });
    }
    setIsCallDialogOpen(false);
  };
  
  const handleSendSms = () => {
    if (!smsText) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }
    
    // Log the SMS
    try {
      const smsRecord = logSmsMessage(
        lead.phone || '', 
        smsText, 
        'outgoing',
        lead.name
      );
      
      // Add a note for the SMS
      onAddNote(lead.id, {
        text: `SMS sent: "${smsText}"`,
        type: 'sms',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "SMS sent and logged",
        description: `Message sent to ${lead.name}`,
      });
    } catch (error) {
      console.error('Error logging SMS:', error);
      toast({
        title: "Error logging SMS",
        description: "Message sent but could not be logged",
        variant: "destructive"
      });
    }
    
    setIsSmsDialogOpen(false);
    setSmsText('');
  };
  
  const handleSendLetter = () => {
    if (!letterText) {
      toast({
        title: "Missing content",
        description: "Please enter letter content.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Track the letter
      const letterRecord = trackLetterSending(
        lead.name,
        letterText,
        letterAddress || undefined
      );
      
      setLetterTrackingNumber(letterRecord.trackingNumber || '');
      
      // Add a note for the letter
      onAddNote(lead.id, {
        text: `Letter sent: "${letterText.substring(0, 50)}${letterText.length > 50 ? '...' : ''}" Tracking #: ${letterRecord.trackingNumber}`,
        type: 'letter',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Letter queued and tracked",
        description: `Letter to ${lead.name} has been queued. Tracking #: ${letterRecord.trackingNumber}`,
      });
    } catch (error) {
      console.error('Error tracking letter:', error);
      toast({
        title: "Error tracking letter",
        description: "Letter queued but could not be tracked",
        variant: "destructive"
      });
    }
    
    setIsLetterDialogOpen(false);
    setLetterText('');
    setLetterAddress('');
  };

  const handleViewSmsHistory = () => {
    if (!lead.phone) {
      toast({
        title: "Missing phone number",
        description: "This lead doesn't have a phone number to view SMS history.",
        variant: "destructive"
      });
      return;
    }
    
    // Get SMS history for this lead
    const history = getSmsHistory(lead.phone);
    setSmsHistory(history);
    setIsSmsHistoryDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCallDialogOpen(true)}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Call Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Call {lead.name}</DialogTitle>
            <DialogDescription>
              Calls can be recorded for quality and training purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">Phone number: {lead.phone || 'Not available'}</p>
            
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50 mb-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                <span>{isRecording ? 'Recording active' : 'Recording inactive'}</span>
              </div>
              <Button 
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleCallRecording}
                className="gap-1"
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Record Call"}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {lead.phone 
                ? 'Clicking "Call Now" will initiate a call using your default phone application.' 
                : 'This lead does not have a phone number. Please add one before calling.'}
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCall} 
              disabled={!lead.phone}
              className="bg-green-600 hover:bg-green-700"
            >
              Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSmsDialogOpen(true)}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Send SMS</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send SMS</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send SMS to {lead.name}</DialogTitle>
            <DialogDescription>
              All SMS messages are logged for your records.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <p>Phone number: {lead.phone || 'Not available'}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewSmsHistory}
                disabled={!lead.phone}
              >
                View History
              </Button>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="quickSmsText" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="quickSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
                disabled={!lead.phone}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendSms} 
              disabled={!lead.phone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS History Dialog */}
      <Dialog open={isSmsHistoryDialogOpen} onOpenChange={setIsSmsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>SMS History with {lead.name}</DialogTitle>
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
            <Button onClick={() => setIsSmsHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Letter Dialog */}
      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsLetterDialogOpen(true)}
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">Send Letter</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send Letter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Letter for {lead.name}</DialogTitle>
            <DialogDescription>
              Letters are tracked automatically with a tracking number.
            </DialogDescription>
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
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
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
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendLetter}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsNotesDialogOpen(true)}
                className="h-8 w-8"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Lead Notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Notes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Notes for {lead.name}</DialogTitle>
          </DialogHeader>
          
          <LeadNotes 
            lead={lead} 
            onAddNote={onAddNote}
          />
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          
          <LeadForm 
            initialData={lead}
            onSubmit={(updatedLead) => {
              onEdit(updatedLead);
              setIsEditDialogOpen(false);
              toast({
                title: "Lead updated",
                description: "Lead details have been updated successfully.",
              });
            }}
          />
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {lead.name} from your leads. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
