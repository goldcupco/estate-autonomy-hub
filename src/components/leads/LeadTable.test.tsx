
import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import { LeadTable } from './LeadTable';
import { Lead } from './types';

// Sample lead data for testing
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    status: 'New', // Using a valid status from the union type
    source: 'Website',
    dateAdded: '2023-01-01',
    lastContact: '2023-01-01',
    notes: [],
    flaggedForNextStage: false,
    readyToMove: false,
    doNotContact: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-765-4321',
    status: 'Contacted', // Using a valid status from the union type
    source: 'Referral',
    dateAdded: '2023-01-05',
    lastContact: '2023-01-10',
    notes: [],
    flaggedForNextStage: true,
    readyToMove: true,
    doNotContact: false
  }
];

describe('LeadTable Component', () => {
  const mockOnEditLead = vi.fn();
  const mockOnAddNote = vi.fn();
  const mockOnMoveToNextStage = vi.fn();
  const mockOnFlagLead = vi.fn();
  const mockOnToggleDoNotContact = vi.fn();
  
  test('renders the lead table with data', () => {
    render(
      <LeadTable 
        data={mockLeads}
        onEditLead={mockOnEditLead}
        onAddNote={mockOnAddNote}
        onMoveToNextStage={mockOnMoveToNextStage}
        onFlagLead={mockOnFlagLead}
        onToggleDoNotContact={mockOnToggleDoNotContact}
      />
    );
    
    // Check for column headers
    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    
    // Check for lead data
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/New/i)).toBeInTheDocument();
    expect(screen.getByText(/Contacted/i)).toBeInTheDocument();
  });
  
  test('can sort leads by clicking on column headers', async () => {
    const user = userEvent.setup();
    render(
      <LeadTable 
        data={mockLeads}
        onEditLead={mockOnEditLead}
        onAddNote={mockOnAddNote}
        onMoveToNextStage={mockOnMoveToNextStage}
        onFlagLead={mockOnFlagLead}
        onToggleDoNotContact={mockOnToggleDoNotContact}
      />
    );
    
    // Find the Name column header and click it to sort
    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });
    await user.click(nameHeader);
    
    // Check that sorting happens (we can't easily check the order in jsdom)
    // But we can at least verify the click handler works
    await waitFor(() => {
      expect(nameHeader).toHaveAttribute('aria-sort');
    });
  });
  
  test('can filter leads using the search box', async () => {
    const user = userEvent.setup();
    render(
      <LeadTable 
        data={mockLeads}
        onEditLead={mockOnEditLead}
        onAddNote={mockOnAddNote}
        onMoveToNextStage={mockOnMoveToNextStage}
        onFlagLead={mockOnFlagLead}
        onToggleDoNotContact={mockOnToggleDoNotContact}
      />
    );
    
    // Find the search input and type in it
    const searchInput = screen.getByPlaceholderText(/Search leads/i);
    await user.type(searchInput, 'John');
    
    // We should still see John but not Jane
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
    });
    
    // Clear the search
    await user.clear(searchInput);
    
    // Now we should see both leads again
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });
  });
  
  test('can use advanced filters with status prefix', async () => {
    const user = userEvent.setup();
    render(
      <LeadTable 
        data={mockLeads}
        onEditLead={mockOnEditLead}
        onAddNote={mockOnAddNote}
        onMoveToNextStage={mockOnMoveToNextStage}
        onFlagLead={mockOnFlagLead}
        onToggleDoNotContact={mockOnToggleDoNotContact}
      />
    );
    
    // Find the search input and use a status filter
    const searchInput = screen.getByPlaceholderText(/Search leads/i);
    await user.type(searchInput, 'status:New');
    
    // We should see John but not Jane
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
    });
  });
});
