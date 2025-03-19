
import React, { useState } from 'react';
import { MoreHorizontal, Pencil, MessageCircle, Phone, Mail, Trash, Flag, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Lead, Note } from './types';
import { toast } from 'sonner';
import { getNextStage } from './LeadData';

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editedLead, setEditedLead] = useState<Lead>(lead);

  const handleEditSubmit = () => {
    if (onEdit) {
      onEdit(editedLead);
    }
    setIsEditDialogOpen(false);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    if (onAddNote) {
      const note: Omit<Note, 'id'> = {
        text: noteText,
        type: 'note',
        timestamp: new Date().toISOString()
      };
      
      onAddNote(lead.id, note);
      setNoteText('');
      setIsNoteDialogOpen(false);
    }
  };

  const handleDeleteLead = () => {
    if (onDelete) {
      onDelete(lead.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleToggleFlag = () => {
    if (onFlagForNextStage) {
      onFlagForNextStage(lead.id, !lead.flaggedForNextStage);
    }
    setIsPopoverOpen(false);
  };

  const handleToggleDoNotContact = () => {
    if (onToggleDoNotContact) {
      onToggleDoNotContact(lead.id, !lead.doNotContact);
    }
    setIsPopoverOpen(false);
  };

  // Get the next stage for this lead
  const nextStage = getNextStage(lead.status);

  return (
    <>
      <div className="space-y-2">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Lead
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => setIsNoteDialogOpen(true)}
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
        
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
              
              {onDelete && (
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Lead
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update lead information</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Full Name</label>
              <Input 
                id="name" 
                value={editedLead.name} 
                onChange={e => setEditedLead({...editedLead, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input 
                id="email" 
                type="email"
                value={editedLead.email} 
                onChange={e => setEditedLead({...editedLead, email: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="phone">Phone</label>
              <Input 
                id="phone" 
                value={editedLead.phone} 
                onChange={e => setEditedLead({...editedLead, phone: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="status">Status</label>
              <Select 
                value={editedLead.status} 
                onValueChange={val => setEditedLead({...editedLead, status: val as Lead['status']})}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Lead">New Lead</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                  <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="source">Source</label>
              <Input 
                id="source" 
                value={editedLead.source} 
                onChange={e => setEditedLead({...editedLead, source: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {lead.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLead}>Delete Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
