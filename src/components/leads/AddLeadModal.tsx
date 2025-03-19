
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lead, Note } from '@/components/leads/LeadTable';
import { supabase } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded?: (lead: Lead) => void;
}

type LeadFormState = Omit<Lead, 'notes'> & {
  notes?: string | Note[];
};

export function AddLeadModal({ open, onOpenChange, onLeadAdded }: AddLeadModalProps) {
  const [lead, setLead] = useState<Partial<LeadFormState>>({
    status: 'New',
    source: 'Website Inquiry',
    dateAdded: new Date().toISOString().split('T')[0],
    lastContact: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof LeadFormState, value: any) => {
    setLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!lead.name || !lead.email) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Parse name into first and last name
      const [firstName, ...lastNameParts] = (lead.name || '').split(' ');
      const lastName = lastNameParts.join(' ');
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('leads')
        .insert({
          first_name: firstName,
          last_name: lastName || '',
          email: lead.email,
          phone: lead.phone || '',
          status: lead.status,
          lead_type: 'buyer', // Default
          lead_source: lead.source,
          user_id: 'system', // In a real app, this would be the current user ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;

      // Create initial note if notes text exists
      const notes: Note[] = [];
      if (lead.notes && typeof lead.notes === 'string' && lead.notes.trim() !== '') {
        notes.push({
          id: uuidv4(),
          text: lead.notes,
          type: 'other',
          timestamp: new Date().toISOString()
        });
      }

      // Create Lead object with returned DB ID
      const newLead: Lead = {
        id: data?.[0]?.id || `lead-${Date.now()}`,
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'New',
        source: lead.source || 'Website Inquiry',
        dateAdded: lead.dateAdded || new Date().toISOString().split('T')[0],
        lastContact: lead.lastContact || new Date().toISOString().split('T')[0],
        notes: notes,
        flaggedForNextStage: false,
        readyToMove: false,
        doNotContact: false
      };

      if (onLeadAdded) {
        onLeadAdded(newLead);
      }

      toast.success('Lead added successfully');
      
      // Reset form
      setLead({
        status: 'New',
        source: 'Website Inquiry',
        dateAdded: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0]
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => {
      if (!isSubmitting) onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the details of your new lead
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name*</Label>
            <Input
              id="name"
              value={lead.name || ''}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address*</Label>
            <Input
              id="email"
              type="email"
              value={lead.email || ''}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="john.smith@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={lead.phone || ''}
              onChange={e => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={lead.status || 'New'}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Negotiating">Negotiating</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select
                value={lead.source || 'Website Inquiry'}
                onValueChange={value => handleInputChange('source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website Inquiry">Website Inquiry</SelectItem>
                  <SelectItem value="Zillow">Zillow</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={typeof lead.notes === 'string' ? lead.notes : ''}
              onChange={e => handleInputChange('notes', e.target.value)}
              placeholder="Additional information about this lead..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Lead'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
