
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, FileText, BarChart3 } from 'lucide-react';
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

const Index = () => {
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
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to RealEstate Pro</h1>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Dashboard Card */}
              <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Dashboard</h2>
                  <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">View your analytics, metrics, and performance data.</p>
                <Link to="/dashboard">
                  <Button className="w-full">View Dashboard</Button>
                </Link>
              </div>
              
              {/* Properties Card */}
              <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Properties</h2>
                  <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <Building className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Manage your real estate property listings and details.</p>
                <Link to="/properties">
                  <Button className="w-full">View Properties</Button>
                </Link>
              </div>
              
              {/* Contracts Card */}
              <div className="glass-card rounded-xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Contracts</h2>
                  <div className="p-2 bg-primary/10 text-primary rounded-full">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Manage your digital contracts and track document status.</p>
                <Link to="/contracts">
                  <Button className="w-full">View Contracts</Button>
                </Link>
              </div>
            </div>
            
            {/* Getting Started Section */}
            <div className="glass-card rounded-xl p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
              <div className="space-y-4">
                <p>Welcome to your real estate management platform. Here's how to get started:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Explore the dashboard to see an overview of your properties and metrics.</li>
                  <li>View and manage your properties in the Properties section.</li>
                  <li>Create and track digital contracts in the Contracts section.</li>
                </ol>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
