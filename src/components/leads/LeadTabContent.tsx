
import { LeadTable } from '@/components/leads/LeadTable';
import { Lead } from '@/components/leads/types';

interface LeadTabContentProps {
  data: Lead[];
  status: string;
  onEditLead: (updatedLead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onFlagLead: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage: (lead: Lead) => void;
}

export function LeadTabContent({
  data,
  status,
  onEditLead,
  onDeleteLead,
  onAddNote,
  onFlagLead,
  onMoveToNextStage
}: LeadTabContentProps) {
  // Filter leads by status
  const filteredLeads = status === 'All' ? data : data.filter(lead => lead.status === status);
  
  return (
    <LeadTable 
      data={filteredLeads}
      onEditLead={onEditLead}
      onDeleteLead={onDeleteLead}
      onAddNote={onAddNote}
      onFlagLead={onFlagLead}
      onMoveToNextStage={onMoveToNextStage}
    />
  );
}
