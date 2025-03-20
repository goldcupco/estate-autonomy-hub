
import React, { useState } from 'react';
import { Lead, Note } from './types';
import { EditLeadDialog } from './actions/EditLeadDialog';
import { AddNoteDialog } from './actions/AddNoteDialog';
import { DeleteLeadDialog } from './actions/DeleteLeadDialog';
import { DeleteAction } from './actions/MoreActionsPopover';
import { ActionButtons } from './actions/ActionButtons';

interface LeadActionsProps {
  lead: Lead;
  onEdit?: (updatedLead: Lead) => void;
  onAddNote?: (leadId: string, note: Omit<Note, 'id'>) => void;
  onDelete?: (leadId: string) => void;
  onFlagForNextStage?: (leadId: string, flagged: boolean) => void;
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void;
}

export const LeadActions: React.FC<LeadActionsProps> = ({ 
  lead, 
  onEdit,
  onAddNote,
  onDelete,
  onFlagForNextStage,
  onToggleDoNotContact
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center">
        <ActionButtons 
          onOpenEditDialog={() => setIsEditDialogOpen(true)}
          onOpenNoteDialog={() => setIsNoteDialogOpen(true)}
        />
        
        <DeleteAction 
          lead={lead}
          onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
        />
      </div>
      
      <EditLeadDialog 
        lead={lead}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEdit={onEdit}
      />
      
      <AddNoteDialog 
        lead={lead}
        isOpen={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        onAddNote={onAddNote}
      />
      
      <DeleteLeadDialog 
        lead={lead}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={onDelete}
      />
    </>
  );
};
