
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, ArrowLeft } from 'lucide-react';
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

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
                  <BreadcrumbPage>Documents</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Recent Documents Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Documents</h2>
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Access your recently viewed or edited documents.
              </p>
              <Button className="w-full">View Recent Documents</Button>
            </div>
            
            {/* Document Categories Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Categories</h2>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                  <FolderOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Browse documents by category or create new ones.
              </p>
              <Button className="w-full">Browse Categories</Button>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Document Management</h2>
            <p className="text-muted-foreground mb-4">
              Upload, organize, and share important documents with clients and team members.
            </p>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Document management functionality will be implemented soon.</p>
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

export default Documents;
