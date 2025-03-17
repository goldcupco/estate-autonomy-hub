
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface QuickCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCallDialog({ open, onOpenChange }: QuickCallDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const handleQuickCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    window.location.href = `tel:${phoneNumber}`;
    
    toast({
      title: "Initiating call",
      description: `Calling ${phoneNumber}`,
    });
    
    onOpenChange(false);
    setPhoneNumber('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Make a Quick Call</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
              onClick={(e) => e.stopPropagation()}
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
            onClick={handleQuickCall} 
            className="bg-green-600 hover:bg-green-700"
          >
            Call Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
