
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, Note } from './types';
import { LeadTable } from './LeadTable';
import { Skeleton } from "@/components/ui/skeleton";

interface LeadTabsProps {
  leadsData: Lead[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  onEditLead: (updatedLead: Lead) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onFlagLead: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage: (lead: Lead) => void;
  onToggleDoNotContact: (leadId: string, doNotContact: boolean) => void;
  isLoading?: boolean;
}

export function LeadTabs({
  leadsData,
  currentTab,
  onTabChange,
  onEditLead,
  onAddNote,
  onFlagLead,
  onMoveToNextStage,
  onToggleDoNotContact,
  isLoading = false
}: LeadTabsProps) {
  // Filter leads based on the current tab
  const getFilteredLeads = () => {
    if (currentTab === 'All') {
      return leadsData;
    }
    return leadsData.filter(lead => lead.status === currentTab);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-7 mb-4">
        <TabsTrigger value="All">All Leads</TabsTrigger>
        <TabsTrigger value="New">New</TabsTrigger>
        <TabsTrigger value="Contacted">Contacted</TabsTrigger>
        <TabsTrigger value="Qualified">Qualified</TabsTrigger>
        <TabsTrigger value="Negotiating">Negotiating</TabsTrigger>
        <TabsTrigger value="Closed">Closed</TabsTrigger>
        <TabsTrigger value="Lost">Lost</TabsTrigger>
      </TabsList>
      
      <TabsContent value={currentTab} className="mt-0">
        <LeadTable
          data={getFilteredLeads()}
          onEditLead={onEditLead}
          onAddNote={onAddNote}
          onMoveToNextStage={onMoveToNextStage}
          onFlagLead={onFlagLead}
          onToggleDoNotContact={onToggleDoNotContact}
        />
      </TabsContent>
    </Tabs>
  );
}
