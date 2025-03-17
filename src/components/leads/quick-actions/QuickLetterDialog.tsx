
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuickLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickLetterDialog({ open, onOpenChange }: QuickLetterDialogProps) {
  const [letterRecipient, setLetterRecipient] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const { toast } = useToast();

  const handleQuickLetter = () => {
    if (!letterRecipient || !letterContent) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and letter content.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Letter queued",
      description: `Letter to ${letterRecipient} has been queued for sending`,
    });
    
    onOpenChange(false);
    setLetterRecipient('');
    setLetterContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send a Quick Letter</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="letterRecipient" className="text-sm font-medium">
              Recipient Name/Address
            </label>
            <Input
              id="letterRecipient"
              value={letterRecipient}
              onChange={(e) => setLetterRecipient(e.target.value)}
              placeholder="John Smith, 123 Main St, Anytown, USA"
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleQuickLetter} className="bg-amber-600 hover:bg-amber-700">
            Send Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
