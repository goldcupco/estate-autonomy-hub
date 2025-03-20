
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead } from '../types';

interface EditLeadDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (updatedLead: Lead) => void;
}

export function EditLeadDialog({ lead, isOpen, onOpenChange, onEdit }: EditLeadDialogProps) {
  const [editedLead, setEditedLead] = useState<Lead>(lead);

  const handleEditSubmit = () => {
    if (onEdit) {
      onEdit(editedLead);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
