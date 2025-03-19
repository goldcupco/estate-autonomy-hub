
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { CampaignProvider } from '@/contexts/CampaignContext';
import { TooltipProvider } from "@/components/ui/tooltip";

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

// Mock supabase client
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    data: null,
    error: null,
  },
}));

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
