
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, Note } from './types';
import { LeadTable } from './LeadTable';
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadTabsProps {
  leadsData: Lead[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  onEditLead: (updatedLead: Lead) => void;
  onAddNote: (leadId: string, note: Omit<Note, 'id'>) => void;
  onFlagLead: (leadId: string, flagged: boolean) => void;
  onMoveToNextStage: (lead: Lead) => void;
  onToggleDoNotContact: (leadId: string, doNotContact: boolean) => void;
  onDeleteLead: (leadId: string) => void; // Added this prop
  isLoading?: boolean;
  onAddLead?: () => void;
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
  onDeleteLead, // Added this prop to the destructuring
  isLoading = false,
  onAddLead
}: LeadTabsProps) {
  // Filter leads based on the current tab
  const getFilteredLeads = () => {
    if (currentTab === 'All') {
      return leadsData;
    }
    return leadsData.filter(lead => lead.status === currentTab);
  };

  const filteredLeads = getFilteredLeads();

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
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {currentTab === 'All' 
                ? "You don't have any leads yet" 
                : `You don't have any ${currentTab} leads yet`}
            </p>
            {onAddLead && (
              <Button onClick={onAddLead}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Lead
              </Button>
            )}
          </div>
        ) : (
          <LeadTable
            data={filteredLeads}
            onEditLead={onEditLead}
            onAddNote={onAddNote}
            onMoveToNextStage={onMoveToNextStage}
            onFlagLead={onFlagLead}
            onToggleDoNotContact={onToggleDoNotContact}
            onDeleteLead={onDeleteLead} // Pass the prop to LeadTable
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
