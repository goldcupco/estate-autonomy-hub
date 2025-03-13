
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Send, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Sample contract data
const contractsData = [
  {
    id: '1',
    title: 'Purchase Agreement - 123 Main St',
    recipient: 'john.doe@example.com',
    status: 'Sent',
    date: '2023-05-15',
  },
  {
    id: '2',
    title: 'Lease Agreement - 456 Oak Ave',
    recipient: 'sarah.smith@example.com',
    status: 'Signed',
    date: '2023-05-10',
  },
  {
    id: '3',
    title: 'Option Contract - 789 Pine Ln',
    recipient: 'mike.jones@example.com',
    status: 'Draft',
    date: '2023-05-08',
  },
  {
    id: '4',
    title: 'Assignment Contract - 101 Lake Dr',
    recipient: 'lisa.brown@example.com',
    status: 'Signed',
    date: '2023-05-01',
  },
];

export function Contracts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleSendContract = () => {
    setDialogOpen(false);
    toast({
      title: "Contract sent",
      description: "The contract has been sent to the recipient for signing.",
    });
  };

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Digital Contracts</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 animate-scale-in">
              <Plus className="h-4 w-4" />
              <span>New Contract</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Contract for Signature</DialogTitle>
              <DialogDescription>
                Enter the details below to prepare and send a contract for digital signature.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Contract Title</label>
                <Input id="title" placeholder="Purchase Agreement - 123 Main St" />
              </div>
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">Recipient Email</label>
                <Input id="recipient" type="email" placeholder="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="document" className="text-sm font-medium">Upload Document</label>
                <Input id="document" type="file" className="cursor-pointer" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSendContract} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </DialogFooter>
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
            {contractsData.map((contract) => (
              <TableRow key={contract.id} className="animate-fade-in" style={{ animationDelay: `${parseInt(contract.id) * 100}ms` }}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
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
                  <Button variant="outline" size="sm" className="mr-2">
                    View
                  </Button>
                  {contract.status === 'Draft' && (
                    <Button size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Contracts;
