
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Campaigns from "./pages/Campaigns";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CampaignProvider } from "./contexts/CampaignContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Admin-only route component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// App Routes component that has access to auth context
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties" 
        element={
          <ProtectedRoute>
            <Properties />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/property/:id" 
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contracts" 
        element={
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contacts" 
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leads" 
        element={
          <ProtectedRoute>
            <LeadsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lists" 
        element={
          <ProtectedRoute>
            <Lists />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/calls" 
        element={
          <ProtectedRoute>
            <Calls />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/campaigns" 
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user-management" 
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CampaignProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CampaignProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
