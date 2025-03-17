
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lead, Note } from '../types';
import { useToast } from "@/hooks/use-toast";
import { trackLetterSending } from '@/utils/communicationUtils';

interface LetterDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function LetterDialog({ 
  lead, 
  isOpen, 
  onOpenChange,
  onAddNote
}: LetterDialogProps) {
  const [letterText, setLetterText] = useState('');
  const [letterAddress, setLetterAddress] = useState('');
  const [letterTrackingNumber, setLetterTrackingNumber] = useState('');
  const { toast } = useToast();

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
    
    onOpenChange(false);
    setLetterText('');
    setLetterAddress('');
  };

  return (
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
  );
}
