
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePropertyData } from './usePropertyData';
import { supabase } from '@/integrations/supabase/client';
import { vi as viImport } from 'vitest';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

//Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }
}));

describe('usePropertyData Hook', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnPropertyAdded = vi.fn();
  const mockOnPropertyUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values when no property is provided', () => {
    const { result } = renderHook(() => 
      usePropertyData(null, mockOnOpenChange, mockOnPropertyAdded)
    );

    expect(result.current.property).toEqual({
      status: 'For Sale',
      propertyType: 'House',
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isEditMode).toBe(false);
  });

  it('initializes with provided property in edit mode', () => {
    const mockProperty = {
      id: '123',
      address: '123 Test St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      status: 'For Sale' as const,
      propertyType: 'House' as const,
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      imageUrl: 'https://example.com/image.jpg'
    };

    const { result } = renderHook(() => 
      usePropertyData(mockProperty, mockOnOpenChange, mockOnPropertyAdded, mockOnPropertyUpdated)
    );

    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.isEditMode).toBe(true);
  });

  it('handles input changes correctly', () => {
    const { result } = renderHook(() => 
      usePropertyData(null, mockOnOpenChange, mockOnPropertyAdded)
    );

    act(() => {
      result.current.handleInputChange('address', '456 New St');
    });

    expect(result.current.property.address).toBe('456 New St');
  });

  it('validates required fields before submission', async () => {
    const { result } = renderHook(() => 
      usePropertyData(null, mockOnOpenChange, mockOnPropertyAdded)
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Should not have called the supabase insert
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
