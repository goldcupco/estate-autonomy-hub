
import { Lead, Note } from './LeadTable';

export const getNextStage = (currentStatus: Lead['status']): Lead['status'] | null => {
  const statusFlow: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Closed', 'Lost'];
  const currentIndex = statusFlow.indexOf(currentStatus);
  
  if (currentIndex === -1 || currentIndex >= statusFlow.length - 2) {
    return null;
  }
  
  return statusFlow[currentIndex + 1];
};

export const isLeadReadyToMove = (lead: Lead): boolean => {
  if (!lead.notes || lead.notes.length === 0) return false;
  
  switch (lead.status) {
    case 'New':
      return lead.notes.some(note => ['sms', 'call', 'letter'].includes(note.type));
    case 'Contacted':
      const communicationTypes = new Set(lead.notes
        .filter(note => ['sms', 'call', 'letter'].includes(note.type))
        .map(note => note.type));
      return communicationTypes.size >= 2;
    case 'Qualified':
      return lead.notes.some(note => note.type === 'contract');
    case 'Negotiating':
      return lead.notes.filter(note => note.type === 'contract').length >= 2;
    default:
      return false;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'New': 
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300';
    case 'Contacted': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300';
    case 'Qualified': 
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300';
    case 'Negotiating': 
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300';
    case 'Closed': 
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-300';
    case 'Lost': 
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-300';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'New': return 'new-lead';
    case 'Contacted': return 'contacted-lead';
    case 'Qualified': return 'qualified-lead';
    case 'Negotiating': return 'negotiating-lead';
    case 'Closed': return 'closed-lead';
    case 'Lost': return 'lost-lead';
    default: return 'unknown-lead';
  }
};

// Fixed the return type and omitted the notes property from the returned object
export const formatLeadData = (lead: Lead): Record<string, string | number | boolean> => {
  // Create a new object without the notes property
  const { notes, ...leadWithoutNotes } = lead;
  
  return {
    ...leadWithoutNotes,
    statusLabel: lead.status,
    lastContactFormatted: new Date(lead.lastContact).toLocaleDateString(),
    hasNotes: notes && notes.length > 0,
    noteCount: notes?.length || 0,
  };
};
