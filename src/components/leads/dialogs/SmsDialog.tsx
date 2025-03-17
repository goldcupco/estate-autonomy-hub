
import { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Lead, Note } from '../types';
import { useToast } from "@/hooks/use-toast";
import { logSmsMessage, getSmsHistory } from '@/utils/communicationUtils';

interface SmsDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onViewSmsHistory: () => void;
}

export function SmsDialog({ 
  lead, 
  isOpen, 
  onOpenChange,
  onAddNote,
  onViewSmsHistory
}: SmsDialogProps) {
  const [smsText, setSmsText] = useState('');
  const { toast } = useToast();

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
    
    onOpenChange(false);
    setSmsText('');
  };

  return (
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
            onClick={onViewSmsHistory}
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
  );
}
