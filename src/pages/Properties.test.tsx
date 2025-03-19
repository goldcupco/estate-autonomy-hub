
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/helpers/test-utils';
import userEvent from '@testing-library/user-event';
import Properties from './Properties';
import { supabase } from '@/utils/supabaseClient';

vi.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    data: null,
    error: null,
  }
}));

describe('Properties Page', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock successful data fetching
    const mockSupabaseResponse = {
      data: [
        {
          id: '1',
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
  
  test('renders properties page with property grid', async () => {
    render(<Properties />);
    
    // Check that the properties page renders
    await waitFor(() => {
      expect(screen.getByText(/Properties/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Test St/i)).toBeInTheDocument();
    });
  });
  
  test('displays property details in grid view', async () => {
    render(<Properties />);
    
    await waitFor(() => {
      expect(screen.getByText(/123 Test St/i)).toBeInTheDocument();
      expect(screen.getByText(/Austin, TX/i)).toBeInTheDocument();
      expect(screen.getByText(/3 bed/i)).toBeInTheDocument();
      expect(screen.getByText(/2 bath/i)).toBeInTheDocument();
    });
  });
  
  test('can open add property modal', async () => {
    const user = userEvent.setup();
    render(<Properties />);
    
    await waitFor(() => {
      expect(screen.getByText(/Properties/i)).toBeInTheDocument();
    });
    
    // Find and click the Add Property button
    const addButton = screen.getByRole('button', { name: /Add Property/i });
    await user.click(addButton);
    
    // Check that the modal appears
    await waitFor(() => {
      expect(screen.getByText(/Add New Property/i)).toBeInTheDocument();
    });
  });
});
