
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Send, CheckCircle2, Download, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define contract type
interface Contract {
  id: string;
  title: string;
  recipient: string;
  status: 'Draft' | 'Sent' | 'Signed';
  date: string;
  notes?: string;
}

export function Contracts() {
  // State management
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
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDocument, setFormDocument] = useState<File | null>(null);
  
  const { toast: hookToast } = useToast();
  
  // Handle creating a new contract
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
  
  // Handle sending a contract
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
  
  // Handle deleting a contract
  const handleDeleteContract = (contractId: string) => {
    setContracts(contracts.filter(contract => contract.id !== contractId));
    
    hookToast({
      title: "Contract deleted",
      description: "The contract has been removed.",
    });
  };
  
  // View contract details
  const handleViewContract = (contract: Contract) => {
    setCurrentContract(contract);
    setViewContractDialog(true);
  };
  
  // Open document - now using toast notifications instead of URLs
  const openDocument = (title: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    toast.info(`Opening ${title}`, {
      description: "Document viewer functionality coming soon",
    });
  };
  
  // Reset form fields
  const resetForm = () => {
    setFormTitle('');
    setFormRecipient('');
    setFormNotes('');
    setFormDocument(null);
  };

  return (
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
                  placeholder="Add any relevant details about this contract..." 
                  className="resize-none" 
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <Input 
                  id="document" 
                  type="file" 
                  className="cursor-pointer" 
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormDocument(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  PDF or Word documents only (Max 10MB)
                </p>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => {
                resetForm();
                setNewContractDialog(false);
              }} className="sm:w-auto w-full">
                Cancel
              </Button>
              <Button onClick={handleCreateContract} className="sm:w-auto w-full">
                Create Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Contract Dialog */}
        <Dialog open={viewContractDialog} onOpenChange={setViewContractDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{currentContract?.title}</DialogTitle>
              <DialogDescription>
                Contract details and management options
              </DialogDescription>
            </DialogHeader>
            
            {currentContract && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Recipient</h4>
                    <p>{currentContract.recipient}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="flex items-center mt-1">
                      {currentContract.status === 'Signed' ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Signed
                        </span>
                      ) : currentContract.status === 'Sent' ? (
                        <span className="flex items-center text-amber-600">
                          <Send className="h-4 w-4 mr-1" />
                          Sent
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-1" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date Created</h4>
                    <p>{currentContract.date}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Document</h4>
                    <p>Available</p>
                  </div>
                </div>
                
                {currentContract.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                    <p className="text-sm mt-1">{currentContract.notes}</p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                  {currentContract.status === 'Draft' && (
                    <Button 
                      className="w-full sm:w-auto"
                      onClick={() => {
                        handleSendContract(currentContract.id);
                        setViewContractDialog(false);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => openDocument(currentContract.title)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="glass-card rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} className="animate-fade-in" style={{ animationDelay: `${parseInt(contract.id) * 100}ms` }}>
                <TableCell className="font-medium">
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => openDocument(contract.title)}
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-500 cursor-pointer" />
                    {contract.title}
                  </div>
                </TableCell>
                <TableCell>{contract.recipient}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {contract.status === 'Signed' ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Signed
                      </span>
                    ) : contract.status === 'Sent' ? (
                      <span className="flex items-center text-amber-600">
                        <Send className="h-4 w-4 mr-1" />
                        Sent
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-1" />
                        Draft
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{contract.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewContract(contract)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => openDocument(contract.title, e)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    
                    {contract.status === 'Draft' && (
                      <Button 
                        size="sm"
                        onClick={() => handleSendContract(contract.id)}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Send
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openDocument(contract.title)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {contract.status !== 'Signed' && (
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteContract(contract.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                    <p>No contracts found</p>
                    <p className="text-sm">Create your first contract to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Contracts;
