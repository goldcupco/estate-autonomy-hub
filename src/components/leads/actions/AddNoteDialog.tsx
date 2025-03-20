
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lead, Note } from '../types';

interface AddNoteDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function AddNoteDialog({ lead, isOpen, onOpenChange, onAddNote }: AddNoteDialogProps) {
  const [noteText, setNoteText] = useState('');

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    if (onAddNote) {
      const note: Omit<Note, 'id'> = {
        text: noteText,
        type: "other",
        timestamp: new Date().toISOString()
      };
      
      onAddNote(lead.id, note);
      setNoteText('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add a note about your interaction with this lead</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea 
            placeholder="Enter your note here..." 
            className="min-h-[120px]"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAddNote}>Add Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
