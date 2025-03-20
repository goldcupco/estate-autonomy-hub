
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Flag, Ban, Trash, MoreHorizontal } from 'lucide-react';
import { Lead } from '../types';
import { getNextStage } from '../LeadData';

interface MoreActionsPopoverProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDeleteDialog: () => void;
  onFlagForNextStage?: (leadId: string, flagged: boolean) => void;
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void;
}

export function MoreActionsPopover({ 
  lead, 
  isOpen, 
  onOpenChange, 
  onOpenDeleteDialog,
  onFlagForNextStage, 
  onToggleDoNotContact 
}: MoreActionsPopoverProps) {
  const nextStage = getNextStage(lead.status);

  const handleToggleFlag = () => {
    if (onFlagForNextStage) {
      onFlagForNextStage(lead.id, !lead.flaggedForNextStage);
    }
    onOpenChange(false);
  };

  const handleToggleDoNotContact = () => {
    if (onToggleDoNotContact) {
      onToggleDoNotContact(lead.id, !lead.doNotContact);
    }
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button className="w-full justify-between" variant="outline">
          <span>More Actions</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-2">
          {onFlagForNextStage && nextStage && (
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleToggleFlag}
            >
              <Flag className={`mr-2 h-4 w-4 ${lead.flaggedForNextStage ? 'text-orange-500' : ''}`} />
              {lead.flaggedForNextStage 
                ? `Unflag for ${nextStage}`
                : `Flag for ${nextStage}`
              }
            </Button>
          )}
          
          {onToggleDoNotContact && (
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={handleToggleDoNotContact}
            >
              <Ban className={`mr-2 h-4 w-4 ${lead.doNotContact ? 'text-red-500' : ''}`} />
              {lead.doNotContact 
                ? "Remove Do Not Contact"
                : "Mark as Do Not Contact"
              }
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={() => {
              onOpenChange(false);
              onOpenDeleteDialog();
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Lead
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
