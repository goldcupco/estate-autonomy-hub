
import { QuickCallDialog } from '@/components/leads/quick-actions/QuickCallDialog';
import { QuickSmsDialog } from '@/components/leads/quick-actions/QuickSmsDialog';
import { QuickLetterDialog } from '@/components/leads/quick-actions/QuickLetterDialog';

interface LeadQuickActionDialogsProps {
  quickCallDialogOpen: boolean;
  setQuickCallDialogOpen: (open: boolean) => void;
  quickSmsDialogOpen: boolean;
  setQuickSmsDialogOpen: (open: boolean) => void;
  quickLetterDialogOpen: boolean;
  setQuickLetterDialogOpen: (open: boolean) => void;
}

export function LeadQuickActionDialogs({
  quickCallDialogOpen,
  setQuickCallDialogOpen,
  quickSmsDialogOpen,
  setQuickSmsDialogOpen,
  quickLetterDialogOpen,
  setQuickLetterDialogOpen
}: LeadQuickActionDialogsProps) {
  return (
    <>
      <QuickCallDialog 
        open={quickCallDialogOpen} 
        onOpenChange={setQuickCallDialogOpen} 
      />
      
      <QuickSmsDialog 
        open={quickSmsDialogOpen} 
        onOpenChange={setQuickSmsDialogOpen} 
      />
      
      <QuickLetterDialog 
        open={quickLetterDialogOpen} 
        onOpenChange={setQuickLetterDialogOpen} 
      />
    </>
  );
}
