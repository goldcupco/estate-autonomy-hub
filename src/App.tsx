
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Properties from "./pages/Properties";
import Contracts from "./pages/Contracts";
import Dashboard from "./pages/Dashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Lists from "./pages/Lists";
import Contacts from "./pages/Contacts";
import Calls from "./pages/Calls";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import LeadsPage from "./pages/LeadsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
