
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, MessageCircle, Phone, Mail } from 'lucide-react';

interface ActionButtonsProps {
  onOpenEditDialog: () => void;
  onOpenNoteDialog: () => void;
}

export function ActionButtons({ onOpenEditDialog, onOpenNoteDialog }: ActionButtonsProps) {
  return (
    <div className="space-y-2">
      <Button 
        className="w-full justify-start" 
        variant="outline"
        onClick={onOpenEditDialog}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit Lead
      </Button>
      
      <Button 
        className="w-full justify-start" 
        variant="outline"
        onClick={onOpenNoteDialog}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Add Note
      </Button>
      
      <Button className="w-full justify-start" variant="outline">
        <Phone className="mr-2 h-4 w-4" />
        Call Lead
      </Button>
      
      <Button className="w-full justify-start" variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        Email Lead
      </Button>
    </div>
  );
}
