
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lead } from '../types';
import { useToast } from "@/hooks/use-toast";

interface DeleteConfirmDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (id: string) => void;
}

export function DeleteConfirmDialog({
  lead,
  isOpen,
  onOpenChange,
  onConfirmDelete
}: DeleteConfirmDialogProps) {
  const { toast } = useToast();
  
  const handleDelete = () => {
    // Call the delete function with just the ID parameter
    onConfirmDelete(lead.id);
    
    // Close the dialog
    onOpenChange(false);
    
    // Show a toast notification
    toast({
      title: "Lead deleted",
      description: `${lead.name} has been removed from your leads.`,
    });
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete {lead.name} from your leads. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onOpenChange(false)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={handleDelete} 
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
