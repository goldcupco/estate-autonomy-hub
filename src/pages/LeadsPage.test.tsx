
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import LeadsPage from './LeadsPage';
import { supabase } from '@/utils/supabaseClient';

vi.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    data: null,
    error: null,
  }
}));

describe('Leads Page', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock successful data fetching
    const mockSupabaseResponse = {
      data: [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          status: 'New',
          lead_source: 'Website',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          last_contact_date: '2023-01-01T00:00:00.000Z',
        }
      ],
      error: null
    };
    
    // @ts-ignore - we're mocking the function chain
    supabase.from.mockReturnThis();
    // @ts-ignore
    supabase.select.mockReturnThis();
    // @ts-ignore
    supabase.order.mockResolvedValue(mockSupabaseResponse);
  });
  
  test('renders leads page with headers', async () => {
    render(<LeadsPage />);
    
    // Check that the leads page renders key elements
    await waitFor(() => {
      expect(screen.getByText(/Lead Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Back to Dashboard/i)).toBeInTheDocument();
    });
  });
  
  test('displays lead data in the table', async () => {
    render(<LeadsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/555-123-4567/i)).toBeInTheDocument();
    });
  });
  
  test('can navigate between lead tabs', async () => {
    const user = userEvent.setup();
    render(<LeadsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /All/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /New/i })).toBeInTheDocument();
    });
    
    // Click on the New tab
    const newTab = screen.getByRole('tab', { name: /New/i });
    await user.click(newTab);
    
    // Check that it's selected
    await waitFor(() => {
      expect(newTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});
