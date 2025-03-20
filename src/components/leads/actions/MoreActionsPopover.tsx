
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Lead } from '../types';
import { ActionButton } from '../action-buttons/ActionButton';

interface DeleteActionProps {
  lead: Lead;
  onOpenDeleteDialog: () => void;
}

export function DeleteAction({ lead, onOpenDeleteDialog }: DeleteActionProps) {
  return (
    <ActionButton 
      icon={Trash2} 
      label="Delete Lead"
      variant="ghost"
      colorClasses="text-red-500 hover:text-red-700 hover:bg-red-100"
      onClick={(e) => {
        e.stopPropagation();
        onOpenDeleteDialog();
      }}
    />
  );
}
