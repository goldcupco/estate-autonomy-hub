
import { LeadTable } from '@/components/leads/LeadTable';
import { Lead, Note } from '@/components/leads/types';

interface LeadTabContentProps {
  data: Lead[];
  status: string;
  onEditLead: (updatedLead: Lead) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onFlagLead: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage: (lead: Lead) => void;
  onToggleDoNotCall?: (leadId: string, doNotCall: boolean) => void;
}

export function LeadTabContent({
  data,
  status,
  onEditLead,
  onAddNote,
  onFlagLead,
  onMoveToNextStage,
  onToggleDoNotCall
}: LeadTabContentProps) {
  // Filter leads by status
  const filteredLeads = status === 'All' ? data : data.filter(lead => lead.status === status);
  
  return (
    <LeadTable 
      data={filteredLeads}
      onEditLead={onEditLead}
      onAddNote={onAddNote}
      onFlagLead={onFlagLead}
      onMoveToNextStage={onMoveToNextStage}
      onToggleDoNotCall={onToggleDoNotCall}
    />
  );
}
