
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/helpers/test-utils';
import { PropertyForm } from './PropertyForm';
import { Property } from '@/pages/Properties';

describe('PropertyForm Component', () => {
  const mockHandleInputChange = vi.fn();
  const mockProperty: Partial<Property> = {
    address: '123 Test St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    status: 'For Sale',
    propertyType: 'House'
  };

  beforeEach(() => {
    mockHandleInputChange.mockClear();
  });

  it('renders all form fields with the correct values', () => {
    render(
      <PropertyForm 
        property={mockProperty} 
        handleInputChange={mockHandleInputChange} 
      />
    );

    // Check text inputs
    expect(screen.getByLabelText(/address/i)).toHaveValue(mockProperty.address);
    expect(screen.getByLabelText(/city/i)).toHaveValue(mockProperty.city);
    expect(screen.getByLabelText(/state/i)).toHaveValue(mockProperty.state);
    expect(screen.getByLabelText(/zip code/i)).toHaveValue(mockProperty.zipCode);
    
    // Check number inputs
    expect(screen.getByLabelText(/price/i)).toHaveValue(mockProperty.price);
    expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(mockProperty.bedrooms);
    expect(screen.getByLabelText(/bathrooms/i)).toHaveValue(mockProperty.bathrooms);
    expect(screen.getByLabelText(/square footage/i)).toHaveValue(mockProperty.sqft);
    
    // Check selects - these are more complex to test fully
    expect(screen.getByText(/for sale/i)).toBeInTheDocument();
    expect(screen.getByText(/house/i)).toBeInTheDocument();
  });

  it('calls handleInputChange with correct parameters when inputs change', async () => {
    render(
      <PropertyForm 
        property={mockProperty} 
        handleInputChange={mockHandleInputChange} 
      />
    );

    // Test text input
    const addressInput = screen.getByLabelText(/address/i);
    fireEvent.change(addressInput, { target: { value: '456 New St' } });
    expect(mockHandleInputChange).toHaveBeenCalledWith('address', '456 New St');

    // Test number input
    const priceInput = screen.getByLabelText(/price/i);
    fireEvent.change(priceInput, { target: { value: '500000' } });
    expect(mockHandleInputChange).toHaveBeenCalledWith('price', 500000);
    
    // Testing select changes would require more complex testing with user-event
  });

  it('handles empty property data gracefully', () => {
    const emptyProperty: Partial<Property> = {
      status: 'For Sale',
      propertyType: 'House'
    };
    
    render(
      <PropertyForm 
        property={emptyProperty} 
        handleInputChange={mockHandleInputChange} 
      />
    );
    
    // Check that inputs render with empty values
    expect(screen.getByLabelText(/address/i)).toHaveValue('');
    expect(screen.getByLabelText(/city/i)).toHaveValue('');
  });
});
