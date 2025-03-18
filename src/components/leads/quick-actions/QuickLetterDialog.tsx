
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { trackLetterSending } from '@/utils/communicationUtils';

interface QuickLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickLetterDialog({ open, onOpenChange }: QuickLetterDialogProps) {
  const [letterRecipient, setLetterRecipient] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [letterAddress, setLetterAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuickLetter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!letterRecipient || !letterContent) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and letter content.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would eventually connect to a real mail service API
      // For now, we just track it locally for demo purposes
      const letterRecord = trackLetterSending(
        letterRecipient,
        letterContent,
        letterAddress || undefined
      );
      
      toast({
        title: "Letter queued",
        description: `Letter to ${letterRecipient} has been queued for sending. Tracking #: ${letterRecord.trackingNumber}`,
      });
      
      // Reset form and close dialog
      setLetterRecipient('');
      setLetterContent('');
      setLetterAddress('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending letter:', error);
      toast({
        title: "Error queueing letter",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send a Quick Letter</DialogTitle>
          <DialogDescription>
            Letters are physically printed and mailed via our postal service integration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="letterRecipient" className="text-sm font-medium">
              Recipient Name
            </label>
            <Input
              id="letterRecipient"
              value={letterRecipient}
              onChange={(e) => setLetterRecipient(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="letterAddress" className="text-sm font-medium">
              Mailing Address
            </label>
            <Input
              id="letterAddress"
              value={letterAddress}
              onChange={(e) => setLetterAddress(e.target.value)}
              placeholder="123 Main St, Anytown, USA"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="letterContent" className="text-sm font-medium">
              Letter Content
            </label>
            <Textarea
              id="letterContent"
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              placeholder="Type your letter content here..."
              className="min-h-[200px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleQuickLetter} 
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Send Letter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
