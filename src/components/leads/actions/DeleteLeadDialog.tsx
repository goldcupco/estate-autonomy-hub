
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lead } from '../types';

interface DeleteLeadDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (leadId: string) => void;
}

export function DeleteLeadDialog({ lead, isOpen, onOpenChange, onDelete }: DeleteLeadDialogProps) {
  const handleDeleteLead = () => {
    if (onDelete) {
      onDelete(lead.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {lead.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteLead}>Delete Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
