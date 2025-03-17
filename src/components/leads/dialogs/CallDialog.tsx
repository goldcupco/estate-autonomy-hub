
import { useState } from 'react';
import { Phone, Mic, MicOff } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lead, Note } from '../types';
import { useToast } from "@/hooks/use-toast";
import { startCallRecording, endCallRecording } from '@/utils/communicationUtils';

interface CallDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function CallDialog({ 
  lead, 
  isOpen, 
  onOpenChange,
  onAddNote
}: CallDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const toggleCallRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    onOpenChange(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[400px]" onClick={(e) => e.stopPropagation()}>
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
        <Button 
          variant="outline" 
          type="button"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCall} 
          disabled={!lead.phone}
          className="bg-green-600 hover:bg-green-700"
        >
          Call Now
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
