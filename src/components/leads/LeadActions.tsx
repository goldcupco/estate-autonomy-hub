
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import { Lead } from './LeadTable';
import { useToast } from "@/hooks/use-toast";
import { LeadForm } from './LeadForm';

interface LeadActionsProps {
  lead: Lead;
  onEdit: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
}

export function LeadActions({ lead, onEdit, onDelete }: LeadActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(lead.id);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Lead deleted",
      description: `${lead.name} has been removed from your leads.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Lead</span>
        </Button>
        
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
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Lead</span>
        </Button>
        
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
