
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/helpers/test-utils';
import { MLSImporter } from './index';
import userEvent from '@testing-library/user-event';
import { simulateMLSApiImport } from './mlsUtils';

// Mock the MLS utils
vi.mock('./mlsUtils', () => ({
  simulateMLSApiImport: vi.fn().mockResolvedValue([
    {
      id: 'test-1',
      address: '123 Test St',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345'
    }
  ])
}));

describe('MLSImporter Component', () => {
  const mockOnImportSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both API and CSV import tabs', () => {
    render(<MLSImporter onImportSuccess={mockOnImportSuccess} />);
    
    expect(screen.getByText(/MLS API/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV Upload/i)).toBeInTheDocument();
  });

  it('switches between API and CSV tabs correctly', async () => {
    const user = userEvent.setup();
    render(<MLSImporter onImportSuccess={mockOnImportSuccess} />);
    
    // Should start with API tab
    expect(screen.getByText(/Select MLS Provider/i)).toBeInTheDocument();
    
    // Switch to CSV tab
    await user.click(screen.getByText(/CSV Upload/i));
    expect(screen.getByText(/Upload MLS CSV Data/i)).toBeInTheDocument();
  });

  it('handles MLS API import process correctly', async () => {
    const user = userEvent.setup();
    render(<MLSImporter onImportSuccess={mockOnImportSuccess} />);
    
    // Select an MLS provider
    await user.click(screen.getByText(/Select an MLS provider/i));
    await user.click(screen.getByText(/RETS MLS/i));
    
    // Click import button
    await user.click(screen.getByText(/Start Import/i));
    
    // Wait for the import to complete
    await waitFor(() => {
      expect(simulateMLSApiImport).toHaveBeenCalledWith('rets');
      expect(mockOnImportSuccess).toHaveBeenCalled();
    });
  });

  it('handles CSV file upload process', async () => {
    const user = userEvent.setup();
    render(<MLSImporter onImportSuccess={mockOnImportSuccess} />);
    
    // Switch to CSV tab
    await user.click(screen.getByText(/CSV Upload/i));
    
    // Create a test file
    const file = new File(
      ['address,city,state,zip\n123 Test St,Test City,TX,12345'],
      'test.csv',
      { type: 'text/csv' }
    );
    
    // Get the file input and upload the file
    const input = screen.getByTestId('file-upload');
    await user.upload(input, file);
    
    // Verify file was uploaded
    expect(screen.getByText(/test.csv/i)).toBeInTheDocument();
  });
});
