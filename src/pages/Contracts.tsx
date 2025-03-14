
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Send, CheckCircle2, Download, Eye, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Contract {
  id: string;
  title: string;
  recipient: string;
  status: 'Draft' | 'Sent' | 'Signed';
  date: string;
  notes?: string;
}

export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Purchase Agreement - 123 Main St',
      recipient: 'john.doe@example.com',
      status: 'Sent',
      date: '2023-05-15',
      notes: 'Waiting for signature from buyer',
    },
    {
      id: '2',
      title: 'Lease Agreement - 456 Oak Ave',
      recipient: 'sarah.smith@example.com',
      status: 'Signed',
      date: '2023-05-10',
      notes: 'Completed lease for 12 months',
    },
    {
      id: '3',
      title: 'Option Contract - 789 Pine Ln',
      recipient: 'mike.jones@example.com',
      status: 'Draft',
      date: '2023-05-08',
      notes: 'Draft option contract for 3 months',
    },
    {
      id: '4',
      title: 'Assignment Contract - 101 Lake Dr',
      recipient: 'lisa.brown@example.com',
      status: 'Signed',
      date: '2023-05-01',
      notes: 'Assignment completed successfully',
    },
  ]);
  
  const [newContractDialog, setNewContractDialog] = useState(false);
  const [viewContractDialog, setViewContractDialog] = useState(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');
  
  const [formTitle, setFormTitle] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDocument, setFormDocument] = useState<File | null>(null);
  
  const { toast: hookToast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const handleCreateContract = () => {
    if (!formTitle || !formRecipient) {
      hookToast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const newContract: Contract = {
      id: (contracts.length + 1).toString(),
      title: formTitle,
      recipient: formRecipient,
      status: 'Draft',
      date: new Date().toISOString().split('T')[0],
      notes: formNotes,
    };
    
    setContracts([newContract, ...contracts]);
    resetForm();
    setNewContractDialog(false);
    
    hookToast({
      title: "Contract created",
      description: "The contract has been created as a draft.",
    });
  };
  
  const handleSendContract = (contractId: string) => {
    setContracts(contracts.map(contract => 
      contract.id === contractId 
        ? { ...contract, status: 'Sent' } 
        : contract
    ));
    
    hookToast({
      title: "Contract sent",
      description: "The contract has been sent to the recipient for signing.",
    });
  };
  
  const handleDeleteContract = (contractId: string) => {
    setContracts(contracts.filter(contract => contract.id !== contractId));
    
    hookToast({
      title: "Contract deleted",
      description: "The contract has been removed.",
    });
  };
  
  const handleViewContract = (contract: Contract) => {
    setCurrentContract(contract);
    setViewContractDialog(true);
  };
  
  const openDocument = (title: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedDocument(`/sample-contract.pdf`);
    setDocumentViewerOpen(true);
  };
  
  const resetForm = () => {
    setFormTitle('');
    setFormRecipient('');
    setFormNotes('');
    setFormDocument(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-6 py-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold tracking-tight">Digital Contracts</h1>
              
              <Dialog open={newContractDialog} onOpenChange={setNewContractDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 animate-scale-in">
                    <Plus className="h-4 w-4" />
                    <span>New Contract</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                    <DialogDescription>
                      Enter the details below to prepare a contract for digital signature.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Contract Title</Label>
                      <Input 
                        id="title" 
                        placeholder="Purchase Agreement - 123 Main St" 
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Email</Label>
                      <Input 
                        id="recipient" 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        value={formRecipient}
                        onChange={(e) => setFormRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes or details about this contract..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">Upload Document</Label>
                      <Input
                        id="document"
                        type="file"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setFormDocument(files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewContractDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateContract}>
                      Create Draft
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm animate-fade-up">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow 
                        key={contract.id} 
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => handleViewContract(contract)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {contract.title}
                          </div>
                        </TableCell>
                        <TableCell>{contract.recipient}</TableCell>
                        <TableCell>{contract.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {contract.status === 'Signed' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {contract.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Open menu</span>
                                <span>•••</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewContract(contract);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                openDocument(contract.title, e);
                              }}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              
                              {contract.status === 'Draft' && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendContract(contract.id);
                                }}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send to Recipient
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContract(contract.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Contract
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* View Contract Dialog */}
      <Dialog open={viewContractDialog} onOpenChange={setViewContractDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentContract?.title}</DialogTitle>
            <DialogDescription>
              Contract details and status information.
            </DialogDescription>
          </DialogHeader>
          
          {currentContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Recipient</p>
                  <p className="text-sm text-muted-foreground">{currentContract.recipient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">{currentContract.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">{currentContract.status}</p>
                </div>
              </div>
              
              {currentContract.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{currentContract.notes}</p>
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={(e) => openDocument(currentContract.title, e as React.MouseEvent)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Document
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Document Viewer */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Contract Document</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 h-full min-h-[60vh]">
            <iframe 
              src={selectedDocument} 
              className="w-full h-full border rounded-md"
              title="Contract Document Viewer"
            />
          </div>
          
          <DialogFooter>
            <Button asChild>
              <a href={selectedDocument} download target="_blank" rel="noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Contracts;
