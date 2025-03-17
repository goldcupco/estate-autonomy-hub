
import { useState } from 'react';
import { Pencil, Trash2, MessageSquare, Phone, Mail, FileText } from 'lucide-react';
import { Dialog } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Lead, Note } from './types';
import { LeadForm } from './LeadForm';
import { LeadNotes } from './LeadNotes';
import { ActionButton } from './action-buttons/ActionButton';
import { CallDialog } from './dialogs/CallDialog';
import { SmsDialog } from './dialogs/SmsDialog';
import { SmsHistoryDialog } from './dialogs/SmsHistoryDialog';
import { LetterDialog } from './dialogs/LetterDialog';
import { DeleteConfirmDialog } from './dialogs/DeleteConfirmDialog';
import { getSmsHistory, SmsRecord } from '@/utils/communicationUtils';

interface LeadActionsProps {
  lead: Lead;
  onEdit: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
}

export function LeadActions({ lead, onEdit, onDelete, onAddNote }: LeadActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isSmsDialogOpen, setIsSmsDialogOpen] = useState(false);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [isSmsHistoryDialogOpen, setIsSmsHistoryDialogOpen] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SmsRecord[]>([]);
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("LeadActions: handleDelete called", lead.id);
    onDelete(lead.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Lead deleted",
      description: `${lead.name} has been removed from your leads.`,
    });
  };

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {/* Call Button & Dialog */}
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
      
      {/* SMS Button & Dialog */}
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

      {/* SMS History Dialog */}
      <Dialog open={isSmsHistoryDialogOpen} onOpenChange={setIsSmsHistoryDialogOpen}>
        <SmsHistoryDialog 
          lead={lead}
          isOpen={isSmsHistoryDialogOpen}
          onOpenChange={setIsSmsHistoryDialogOpen}
          smsHistory={smsHistory}
        />
      </Dialog>

      {/* Letter Button & Dialog */}
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

      {/* Notes Button & Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <ActionButton 
          onClick={handleNotesClick}
          icon={MessageSquare}
          label="View Notes"
        />
        
        <div className="contents">
          {isNotesDialogOpen && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" onClick={(e) => e.stopPropagation()}>
              <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                  <h2 className="text-lg font-semibold text-foreground">Notes for {lead.name}</h2>
                </div>
                
                <LeadNotes 
                  lead={lead} 
                  onAddNote={onAddNote}
                />
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsNotesDialogOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit Button & Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ActionButton 
          onClick={handleEditClick}
          icon={Pencil}
          label="Edit Lead"
        />
        
        {isEditDialogOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" onClick={(e) => e.stopPropagation()}>
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                <h2 className="text-lg font-semibold text-foreground">Edit Lead</h2>
              </div>
              
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
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Button & Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ActionButton 
          onClick={handleDeleteClick}
          icon={Trash2}
          label="Delete Lead"
          colorClasses="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        />
        <DeleteConfirmDialog 
          lead={lead}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirmDelete={onDelete}
        />
      </AlertDialog>
    </div>
  );
}
