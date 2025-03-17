
import { useState } from 'react';
import { Pencil, MessageSquare, Phone, Mail, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Lead, Note } from './types';
import { LeadForm } from './LeadForm';
import { LeadNotes } from './LeadNotes';
import { ActionButton } from './action-buttons/ActionButton';
import { CallDialog } from './dialogs/CallDialog';
import { SmsDialog } from './dialogs/SmsDialog';
import { SmsHistoryDialog } from './dialogs/SmsHistoryDialog';
import { LetterDialog } from './dialogs/LetterDialog';
import { getSmsHistory, SmsRecord } from '@/utils/communicationUtils';

interface LeadActionsProps {
  lead: Lead;
  onEdit: (updatedLead: Lead) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function LeadActions({ lead, onEdit, onAddNote }: LeadActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [isSmsHistoryDialogOpen, setIsSmsHistoryDialogOpen] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SmsRecord[]>([]);
  const { toast } = useToast();

  const handleViewSmsHistory = () => {
    if (!lead.phone) {
      toast({
        title: "Missing phone number",
        description: "This lead doesn't have a phone number to view SMS history.",
        variant: "destructive"
      });
      return;
    }
    
    const history = getSmsHistory(lead.phone);
    setSmsHistory(history);
    setIsSmsHistoryDialogOpen(true);
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsCallDialogOpen(true);
  };

  const handleSmsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSmsDialogOpen(true);
  };

  const handleLetterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsLetterDialogOpen(true);
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsNotesDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <ActionButton 
          onClick={handleCallClick}
          icon={Phone}
          label="Call Lead"
          colorClasses="text-green-600 hover:text-green-700 hover:bg-green-100"
        />
        <CallDialog 
          lead={lead} 
          isOpen={isCallDialogOpen} 
          onOpenChange={setIsCallDialogOpen}
          onAddNote={onAddNote}
        />
      </Dialog>
      
      <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
        <ActionButton 
          onClick={handleSmsClick}
          icon={MessageSquare}
          label="Send SMS"
          colorClasses="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
        />
        <SmsDialog 
          lead={lead} 
          isOpen={isSmsDialogOpen} 
          onOpenChange={setIsSmsDialogOpen}
          onAddNote={onAddNote}
          onViewSmsHistory={handleViewSmsHistory}
        />
      </Dialog>

      <Dialog open={isSmsHistoryDialogOpen} onOpenChange={setIsSmsHistoryDialogOpen}>
        <SmsHistoryDialog 
          lead={lead}
          isOpen={isSmsHistoryDialogOpen}
          onOpenChange={setIsSmsHistoryDialogOpen}
          smsHistory={smsHistory}
        />
      </Dialog>

      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <ActionButton 
          onClick={handleLetterClick}
          icon={FileText}
          label="Send Letter"
          colorClasses="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
        />
        <LetterDialog 
          lead={lead} 
          isOpen={isLetterDialogOpen} 
          onOpenChange={setIsLetterDialogOpen}
          onAddNote={onAddNote}
        />
      </Dialog>

      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <ActionButton 
          onClick={handleNotesClick}
          icon={MessageSquare}
          label="View Notes"
        />
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notes for {lead.name}</DialogTitle>
          </DialogHeader>
          <LeadNotes 
            lead={lead} 
            onAddNote={onAddNote}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ActionButton 
          onClick={handleEditClick}
          icon={Pencil}
          label="Edit Lead"
        />
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm 
            initialData={lead}
            onSubmit={(updatedLead) => {
              onEdit(updatedLead);
              setIsEditDialogOpen(false);
              toast({
                title: "Lead updated",
                description: "Lead details have been updated successfully.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
