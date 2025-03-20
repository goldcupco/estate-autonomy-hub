
import { useLeads } from '@/hooks/useLeads';
import { useLeadOperations } from '@/hooks/useLeadOperations';
import { LeadInfoBanner } from '@/components/leads/LeadInfoBanner';
import { LeadHeader } from '@/components/leads/LeadHeader';
import { LeadQuickActionDialogs } from '@/components/leads/LeadQuickActionDialogs';
import { LeadTabs } from '@/components/leads/LeadTabs';

export function Leads() {
  // Use custom hooks for cleaner code organization
  const { 
    leadsData, 
    setLeadsData, 
    isLoading, 
    currentTab, 
    setCurrentTab 
  } = useLeads();

  const {
    quickCallDialogOpen,
    setQuickCallDialogOpen,
    quickSmsDialogOpen,
    setQuickSmsDialogOpen,
    quickLetterDialogOpen,
    setQuickLetterDialogOpen,
    handleEditLead,
    handleAddNote,
    handleAddLead,
    handleFlagLead,
    handleToggleDoNotContact,
    handleMoveToNextStage,
    handleDeleteLead
  } = useLeadOperations(leadsData, setLeadsData);

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <LeadHeader 
        onLeadAdded={handleAddLead}
        onOpenCall={() => setQuickCallDialogOpen(true)}
        onOpenSms={() => setQuickSmsDialogOpen(true)}
        onOpenLetter={() => setQuickLetterDialogOpen(true)}
      />
      
      <LeadInfoBanner />
      
      <LeadQuickActionDialogs 
        quickCallDialogOpen={quickCallDialogOpen}
        setQuickCallDialogOpen={setQuickCallDialogOpen}
        quickSmsDialogOpen={quickSmsDialogOpen}
        setQuickSmsDialogOpen={setQuickSmsDialogOpen}
        quickLetterDialogOpen={quickLetterDialogOpen}
        setQuickLetterDialogOpen={setQuickLetterDialogOpen}
      />
      
      <LeadTabs 
        leadsData={leadsData}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onEditLead={handleEditLead}
        onAddNote={handleAddNote}
        onFlagLead={handleFlagLead}
        onMoveToNextStage={handleMoveToNextStage}
        onToggleDoNotContact={handleToggleDoNotContact}
        onDeleteLead={handleDeleteLead}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Leads;
