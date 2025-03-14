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




