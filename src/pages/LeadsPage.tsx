
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LeadsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Subscribe to global sidebar state changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  // On mount, initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
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
                  <BreadcrumbPage>Leads</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Leads</h2>
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Track and manage your potential clients and leads in one place.
            </p>
            
            <div className="text-center py-8">
              <p className="text-muted-foreground">Lead management functionality will be implemented soon.</p>
              <Link to="/dashboard" className="mt-4 inline-block">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadsPage;
