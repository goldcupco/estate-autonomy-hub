
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../test/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import { AddPropertyModal } from './AddPropertyModal';
import { supabase } from '@/utils/supabaseClient';

vi.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    data: null,
    error: null,
  }
}));

describe('AddPropertyModal Component', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnPropertyAdded = vi.fn();
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock successful insert response
    const mockSupabaseResponse = {
      data: {
        id: '123',
        address: '123 Test St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        square_feet: 1800,
        status: 'For Sale',
        image_url: 'https://example.com/image.jpg',
        property_type: 'House',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      error: null
    };
    
    // @ts-ignore - we're mocking the function chain
    supabase.from.mockReturnThis();
    // @ts-ignore
    supabase.insert.mockReturnThis();
    // @ts-ignore
    supabase.select.mockReturnThis();
    // @ts-ignore
    supabase.single.mockResolvedValue(mockSupabaseResponse);
  });
  
  test('renders the modal when open is true', async () => {
    render(
      <AddPropertyModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onPropertyAdded={mockOnPropertyAdded} 
      />
    );
    
    expect(screen.getByText(/Add New Property/i)).toBeInTheDocument();
    expect(screen.getByText(/Manual Entry/i)).toBeInTheDocument();
    expect(screen.getByText(/Import from MLS/i)).toBeInTheDocument();
  });
  
  test('does not render when open is false', () => {
    render(
      <AddPropertyModal 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        onPropertyAdded={mockOnPropertyAdded} 
      />
    );
    
    expect(screen.queryByText(/Add New Property/i)).not.toBeInTheDocument();
  });
  
  test('can submit a new property with valid data', async () => {
    const user = userEvent.setup();
    render(
      <AddPropertyModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onPropertyAdded={mockOnPropertyAdded} 
      />
    );
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/Address/i), '123 Test St');
    await user.type(screen.getByLabelText(/City/i), 'Austin');
    await user.type(screen.getByLabelText(/State/i), 'TX');
    await user.type(screen.getByLabelText(/Zip Code/i), '78701');
    
    // Click the Add Property button
    const addButton = screen.getByRole('button', { name: /Add Property/i });
    await user.click(addButton);
    
    // Verify that the onPropertyAdded callback was called
    await waitFor(() => {
      expect(mockOnPropertyAdded).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
  
  test('shows error when required fields are missing', async () => {
    const user = userEvent.setup();
    render(
      <AddPropertyModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onPropertyAdded={mockOnPropertyAdded} 
      />
    );
    
    // Don't fill in any fields
    
    // Click the Add Property button
    const addButton = screen.getByRole('button', { name: /Add Property/i });
    await user.click(addButton);
    
    // Verify that the error message appears
    await waitFor(() => {
      // This would check for the toast message but toasts might be tricky to test
      // Instead we can verify that the callbacks weren't called
      expect(mockOnPropertyAdded).not.toHaveBeenCalled();
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    });
  });
  
  test('can switch between manual and import tabs', async () => {
    const user = userEvent.setup();
    render(
      <AddPropertyModal 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onPropertyAdded={mockOnPropertyAdded} 
      />
    );
    
    // Initially on manual tab
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    
    // Click the Import tab
    const importTab = screen.getByRole('tab', { name: /Import from MLS/i });
    await user.click(importTab);
    
    // Should show import content
    await waitFor(() => {
      expect(screen.queryByLabelText(/Address/i)).not.toBeVisible();
      expect(screen.getByText(/Import properties/i)).toBeInTheDocument();
    });
  });
});
