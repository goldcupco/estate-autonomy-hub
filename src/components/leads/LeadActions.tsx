
import { useState } from 'react';
import { Pencil, Trash2, MessageSquare, Phone, Mail, FileText } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Lead, Note } from './LeadTable';
import { useToast } from "@/hooks/use-toast";
import { LeadForm } from './LeadForm';
import { LeadNotes } from './LeadNotes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [smsText, setSmsText] = useState('');
  const [letterText, setLetterText] = useState('');
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(lead.id);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Lead deleted",
      description: `${lead.name} has been removed from your leads.`,
    });
  };

  const handleCall = () => {
    // In a real app, this would integrate with a phone API
    if (lead.phone) {
      window.location.href = `tel:${lead.phone}`;
      
      // Add a note for the call
      onAddNote(lead.id, {
        text: `Phone call initiated`,
        type: 'call',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Initiating call",
        description: `Calling ${lead.name} at ${lead.phone}`,
      });
    } else {
      toast({
        title: "Missing phone number",
        description: "This lead doesn't have a phone number.",
        variant: "destructive"
      });
    }
    setIsCallDialogOpen(false);
  };
  
  const handleSendSms = () => {
    if (!smsText) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would integrate with an SMS API
    // For demo purposes, we'll just show a notification
    toast({
      title: "SMS sent",
      description: `Message sent to ${lead.name}`,
    });
    
    // Add a note for the SMS
    onAddNote(lead.id, {
      text: `SMS sent: "${smsText}"`,
      type: 'sms',
      timestamp: new Date().toISOString()
    });
    
    setIsSmsDialogOpen(false);
    setSmsText('');
  };
  
  const handleSendLetter = () => {
    if (!letterText) {
      toast({
        title: "Missing content",
        description: "Please enter letter content.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would integrate with a letter/mail service API
    // For demo purposes, we'll just show a notification
    toast({
      title: "Letter queued",
      description: `Letter to ${lead.name} has been queued for sending`,
    });
    
    // Add a note for the letter
    onAddNote(lead.id, {
      text: `Letter sent: "${letterText.substring(0, 50)}${letterText.length > 50 ? '...' : ''}"`,
      type: 'letter',
      timestamp: new Date().toISOString()
    });
    
    setIsLetterDialogOpen(false);
    setLetterText('');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsCallDialogOpen(true)}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <Phone className="h-4 w-4" />
                <span className="sr-only">Call Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Call Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Call {lead.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">Phone number: {lead.phone || 'Not available'}</p>
            <p className="text-sm text-muted-foreground">
              {lead.phone 
                ? 'Clicking "Call Now" will initiate a call using your default phone application.' 
                : 'This lead does not have a phone number. Please add one before calling.'}
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCall} 
              disabled={!lead.phone}
              className="bg-green-600 hover:bg-green-700"
            >
              Call Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={isSmsDialogOpen} onOpenChange={setIsSmsDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSmsDialogOpen(true)}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Send SMS</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send SMS</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send SMS to {lead.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">Phone number: {lead.phone || 'Not available'}</p>
            
            <div className="space-y-2">
              <label htmlFor="quickSmsText" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="quickSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
                disabled={!lead.phone}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendSms} 
              disabled={!lead.phone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Letter Dialog */}
      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsLetterDialogOpen(true)}
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">Send Letter</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send Letter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Letter for {lead.name}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="letterContent" className="text-sm font-medium">
                  Letter Content
                </label>
                <Textarea
                  id="letterContent"
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  placeholder="Type your letter content here..."
                  className="min-h-[200px] mt-2"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSendLetter}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Send Letter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsNotesDialogOpen(true)}
                className="h-8 w-8"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Lead Notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Notes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Notes for {lead.name}</DialogTitle>
          </DialogHeader>
          
          <LeadNotes 
            lead={lead} 
            onAddNote={onAddNote}
          />
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DialogContent className="sm:max-w-[600px]">
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
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Lead</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Lead</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {lead.name} from your leads. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
