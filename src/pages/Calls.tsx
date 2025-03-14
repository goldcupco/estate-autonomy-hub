
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const Calls = () => {
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
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Calls</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Call Management</h1>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Scheduled Calls Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Scheduled</h2>
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-muted-foreground">Upcoming calls</p>
            </div>
            
            {/* Completed Calls Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Completed</h2>
                <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">28</p>
              <p className="text-muted-foreground">Calls this week</p>
            </div>
            
            {/* Contacts Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Contacts</h2>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">45</p>
              <p className="text-muted-foreground">Active contacts</p>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Calls</h2>
            <p className="text-muted-foreground mb-4">
              Schedule and manage your calls with clients and prospects.
            </p>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Call management functionality will be implemented soon.</p>
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

export default Calls;
