
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { LeadQuickActions } from '@/components/leads/quick-actions/LeadQuickActions';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { Lead } from '@/components/leads/types';
import { useState } from 'react';

interface LeadHeaderProps {
  onLeadAdded: (newLead: Lead) => void;
  onOpenCall: () => void;
  onOpenSms: () => void;
  onOpenLetter: () => void;
}

export function LeadHeader({ 
  onLeadAdded, 
  onOpenCall,
  onOpenSms,
  onOpenLetter
}: LeadHeaderProps) {
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <div className="flex space-x-2">
          <LeadQuickActions 
            onOpenCall={onOpenCall}
            onOpenSms={onOpenSms}
            onOpenLetter={onOpenLetter}
          />
          <Button 
            className="flex items-center gap-2 animate-scale-in"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAddLeadModalOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>
      
      <AddLeadModal 
        open={addLeadModalOpen}
        onOpenChange={setAddLeadModalOpen}
        onLeadAdded={onLeadAdded}
      />
    </>
  );
}
