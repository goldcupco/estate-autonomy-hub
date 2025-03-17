
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuickSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSmsDialog({ open, onOpenChange }: QuickSmsDialogProps) {
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const { toast } = useToast();

  const handleQuickSms = () => {
    if (!smsRecipient || !smsText) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and message.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "SMS sent",
      description: `Message sent to ${smsRecipient}`,
    });
    
    onOpenChange(false);
    setSmsRecipient('');
    setSmsText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Quick SMS</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="smsRecipient" className="text-sm font-medium">
              Recipient Phone Number
            </label>
            <Input
              id="smsRecipient"
              value={smsRecipient}
              onChange={(e) => setSmsRecipient(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
            />
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
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleQuickSms} className="bg-blue-600 hover:bg-blue-700">
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
