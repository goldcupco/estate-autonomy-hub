
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, Note } from '@/components/leads/types';
import { LeadTabContent } from './LeadTabContent';

interface LeadTabsProps {
  leadsData: Lead[];
  currentTab: string;
  onTabChange: (value: string) => void;
  onEditLead: (updatedLead: Lead) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onFlagLead: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage: (lead: Lead) => void;
  onToggleDoNotContact?: (leadId: string, doNotContact: boolean) => void; // Renamed from onToggleDoNotCall
}

export function LeadTabs({
  leadsData,
  currentTab,
  onTabChange,
  onEditLead,
  onAddNote,
  onFlagLead,
  onMoveToNextStage,
  onToggleDoNotContact // Renamed from onToggleDoNotCall
}: LeadTabsProps) {
  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  
  return (
    <Tabs 
      defaultValue="All" 
      className="w-full animate-scale-in"
      value={currentTab}
      onValueChange={onTabChange}
    >
      <TabsList className="mb-6">
        {statuses.map(status => (
          <TabsTrigger key={status} value={status}>
            {status === 'All' ? 'All Leads' : status}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {statuses.map(status => (
        <TabsContent key={status} value={status} className="space-y-6 mt-6">
          <LeadTabContent 
            data={leadsData}
            status={status}
            onEditLead={onEditLead}
            onAddNote={onAddNote}
            onFlagLead={onFlagLead}
            onMoveToNextStage={onMoveToNextStage}
            onToggleDoNotContact={onToggleDoNotContact} // Renamed from onToggleDoNotCall
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
