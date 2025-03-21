import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PropertyContainer from "./components/property/PropertyContainer";
import Contracts from "./pages/Contracts";
import Dashboard from "./pages/Dashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Lists from "./pages/Lists";
import Contacts from "./pages/Contacts";
import Calls from "./pages/Calls";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import LeadsPage from "./pages/LeadsPage";
import LeadDetail from "./pages/LeadDetail";
import Campaigns from "./pages/Campaigns";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import AccessManagement from "./pages/AccessManagement";
import PhoneNumberManagement from "./pages/PhoneNumberManagement";
import SellerMapSearch from "./pages/SellerMapSearch";
import BuyerMapSearch from "./pages/BuyerMapSearch";
import Messages from "./pages/Messages";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CampaignProvider } from "./contexts/CampaignContext";

const queryClient = new QueryClient();

// Protected route component with Layout wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Admin-only route component with Layout wrapper
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// App Routes component that has access to auth context
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
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
          <PropertyContainer />
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
        path="/lead/:id" 
        element={
          <ProtectedRoute>
            <LeadDetail />
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
        path="/messages" 
        element={
          <ProtectedRoute>
            <Messages />
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
        path="/seller-map" 
        element={
          <ProtectedRoute>
            <SellerMapSearch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer-map" 
        element={
          <ProtectedRoute>
            <BuyerMapSearch />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/phone-number-management" 
        element={
          <AdminRoute>
            <PhoneNumberManagement />
          </AdminRoute>
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
      <Route 
        path="/access-management" 
        element={
          <AdminRoute>
            <AccessManagement />
          </AdminRoute>
        } 
      />
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
