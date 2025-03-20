
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, MessageCircle, Phone, Mail } from 'lucide-react';
import { ActionButton } from '../action-buttons/ActionButton';

interface ActionButtonsProps {
  onOpenEditDialog: () => void;
  onOpenNoteDialog: () => void;
}

export function ActionButtons({ onOpenEditDialog, onOpenNoteDialog }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <ActionButton 
        icon={Pencil} 
        label="Edit Lead"
        onClick={onOpenEditDialog}
      />
      
      <ActionButton 
        icon={MessageCircle} 
        label="Add Note"
        onClick={onOpenNoteDialog}
      />
      
      <ActionButton 
        icon={Phone} 
        label="Call Lead"
        onClick={() => {}}
      />
      
      <ActionButton 
        icon={Mail} 
        label="Email Lead"
        onClick={() => {}}
      />
    </div>
  );
}
