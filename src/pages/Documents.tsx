import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, ArrowLeft, FileCheck, FileBarChart2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const documents = [
  { 
    id: '1', 
    title: 'Purchase Agreement Template', 
    type: 'pdf',
    path: '/sample-contract.pdf'
  },
  { 
    id: '2', 
    title: 'Lease Contract', 
    type: 'pdf',
    path: '/sample-contract.pdf'
  },
  { 
    id: '3', 
    title: 'Property Disclosure Statement', 
    type: 'pdf',
    path: '/sample-contract.pdf'
  },
  { 
    id: '4', 
    title: 'Offer Letter Template', 
    type: 'pdf',
    path: '/sample-contract.pdf'
  },
];

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{title: string, path: string} | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'docx':
        return <FileBarChart2 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const openDocument = (title: string, path: string, type: string) => {
    setSelectedDocument({ title, path });
    setDocumentViewerOpen(true);
    toast.info(`Opening ${title}`, {
      description: "Displaying document in viewer",
    });
  };

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
              <div className="space-y-3 mb-4">
                {documents.slice(0, 2).map(doc => (
                  <div 
                    key={doc.id} 
                    className="flex items-center p-3 bg-background/80 rounded-lg hover:bg-background cursor-pointer transition-colors"
                    onClick={() => openDocument(doc.title, doc.path, doc.type)}
                  >
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full mr-3">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.type.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => toast.info("View All Documents", { description: "This feature is coming soon!" })}>
                View All Recent Documents
              </Button>
            </div>
            
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
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div 
                  className="p-3 bg-background/80 rounded-lg text-center hover:bg-background cursor-pointer transition-colors"
                  onClick={() => toast.info("Contracts", { description: "Document category view coming soon!" })}
                >
                  <FileCheck className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <p className="text-sm font-medium">Contracts</p>
                </div>
                <div 
                  className="p-3 bg-background/80 rounded-lg text-center hover:bg-background cursor-pointer transition-colors"
                  onClick={() => toast.info("Forms", { description: "Document category view coming soon!" })}
                >
                  <FileText className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <p className="text-sm font-medium">Forms</p>
                </div>
                <div 
                  className="p-3 bg-background/80 rounded-lg text-center hover:bg-background cursor-pointer transition-colors"
                  onClick={() => toast.info("Reports", { description: "Document category view coming soon!" })}
                >
                  <FileBarChart2 className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-sm font-medium">Reports</p>
                </div>
                <div 
                  className="p-3 bg-background/80 rounded-lg text-center hover:bg-background cursor-pointer transition-colors"
                  onClick={() => toast.info("Templates", { description: "Document category view coming soon!" })}
                >
                  <FileText className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-sm font-medium">Templates</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => toast.info("Browse Categories", { description: "This feature is coming soon!" })}>
                Browse All Categories
              </Button>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">All Documents</h2>
            <p className="text-muted-foreground mb-6">
              Upload, organize, and share important documents with clients and team members.
            </p>
            
            <div className="space-y-4">
              {documents.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 bg-background/80 rounded-lg hover:bg-background cursor-pointer transition-colors"
                  onClick={() => openDocument(doc.title, doc.path, doc.type)}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full mr-3">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    openDocument(doc.title, doc.path, doc.type);
                  }}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button onClick={() => toast.info("Upload Document", { description: "Document upload feature is coming soon!" })}>
                Upload New Document
              </Button>
            </div>
          </div>

          <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>{selectedDocument?.title}</DialogTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => window.open(selectedDocument?.path, '_blank')}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setDocumentViewerOpen(false)}
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="mt-4 overflow-auto" style={{ height: 'calc(90vh - 120px)' }}>
                {selectedDocument && (
                  <iframe 
                    src={selectedDocument.path}
                    className="w-full h-full border-0"
                    title={selectedDocument.title}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Documents;
