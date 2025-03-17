
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
import { Lead } from '../types';

interface DeleteConfirmDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (e: React.MouseEvent) => void;
}

export function DeleteConfirmDialog({
  lead,
  isOpen,
  onOpenChange,
  onConfirmDelete
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete {lead.name} from your leads. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel 
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={(e) => {
            e.stopPropagation();
            onConfirmDelete(e);
          }} 
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
