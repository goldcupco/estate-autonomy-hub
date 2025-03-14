
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Key, Plus, Trash, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APIKeyManager } from '@/components/admin/APIKeyManager';
import { PhoneNumberSelector } from '@/components/admin/PhoneNumberSelector';
import { useToast } from '@/hooks/use-toast';

const PhoneNumberManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Simplified access check - removed redirect for debugging
  const isAccessAllowed = isAdmin;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show admin-only message if not admin
  if (!isAccessAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/dashboard" className="w-full">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">
                    <BreadcrumbLink>Home</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/dashboard">
                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Phone Number Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Phone Number Management</h1>
            <div className="flex gap-2">
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Settings
                </Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="phone-numbers" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="phone-numbers">
                <Phone className="mr-2 h-4 w-4" /> Phone Numbers
              </TabsTrigger>
              <TabsTrigger value="api-keys">
                <Key className="mr-2 h-4 w-4" /> API Keys
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="phone-numbers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="mr-2 h-5 w-5" /> 
                      Manage Phone Numbers
                    </div>
                    <Badge variant="outline">Admin Only</Badge>
                  </CardTitle>
                  <CardDescription>
                    Add and manage phone numbers from Twilio and CallRail for your campaigns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PhoneNumberSelector />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api-keys" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key className="mr-2 h-5 w-5" /> 
                      API Key Management
                    </div>
                    <Badge variant="outline">Admin Only</Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage your Twilio and CallRail API keys securely.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <APIKeyManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default PhoneNumberManagement;
