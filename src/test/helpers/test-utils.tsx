
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CampaignProvider } from '@/contexts/CampaignContext';
import { TooltipProvider } from "@/components/ui/tooltip";
import { vi } from 'vitest';

// Create a custom render method that includes providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CampaignProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </CampaignProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  if (options?.route) {
    window.history.pushState({}, 'Test page', options.route);
  }

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock supabase client using vitest instead of jest
vi.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    data: null,
    error: null,
  },
}));

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
