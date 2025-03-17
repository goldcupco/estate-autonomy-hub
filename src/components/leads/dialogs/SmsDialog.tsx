
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
import { parseSpintax, validateSpintax } from '@/utils/spintaxUtils';
import { AlertCircle } from 'lucide-react';
import {
  Switch
} from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [useSpintax, setUseSpintax] = useState(false);
  const [spintaxError, setSpintaxError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateSmsText = (text: string): boolean => {
    if (!text.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return false;
    }
    
    if (useSpintax) {
      const validation = validateSpintax(text);
      if (!validation.isValid) {
        setSpintaxError(validation.error);
        toast({
          title: "Spintax error",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }
    }
    
    setSpintaxError(null);
    return true;
  };

  const handleSendSms = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateSmsText(smsText)) {
      return;
    }
    
    // Process spintax if enabled
    const processedText = useSpintax ? parseSpintax(smsText) : smsText;
    
    // Log the SMS
    try {
      const smsRecord = logSmsMessage(
        lead.phone || '', 
        processedText, 
        'outgoing',
        lead.name
      );
      
      // Add a note for the SMS
      onAddNote(lead.id, {
        text: `SMS sent: "${processedText}"`,
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

  const handleViewHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewSmsHistory();
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
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
            onClick={handleViewHistory}
            disabled={!lead.phone}
          >
            View History
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="quickSmsText" className="text-sm font-medium">
              Message
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Spintax</span>
              <Switch 
                checked={useSpintax} 
                onCheckedChange={setUseSpintax} 
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-muted-foreground cursor-help">
                      <AlertCircle size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Spintax allows you to create message variations.</p>
                    <p className="mt-1">Example: Hello {"{"}name|friend|there{"}"}, how are you?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Textarea
            id="quickSmsText"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            placeholder={useSpintax ? "Hi {there|friend}, how {are you|is it going}?" : "Type your message here..."}
            className="min-h-[120px]"
            disabled={!lead.phone}
            onClick={(e) => e.stopPropagation()}
          />
          {spintaxError && (
            <p className="text-sm text-red-500">{spintaxError}</p>
          )}
          {useSpintax && !spintaxError && (
            <p className="text-xs text-muted-foreground">
              Use {"{"}option1|option2|option3{"}"} format for text variations
            </p>
          )}
        </div>
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
