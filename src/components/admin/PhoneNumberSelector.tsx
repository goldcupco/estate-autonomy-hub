
import { useState, useEffect } from 'react';
import { Phone, RefreshCw, Plus, Trash, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

// Mock available phone numbers
const MOCK_AVAILABLE_NUMBERS = [
  { id: 'pn1', number: '+1 (555) 123-4567', provider: 'twilio', capabilities: ['voice', 'sms'], region: 'US-CA' },
  { id: 'pn2', number: '+1 (555) 234-5678', provider: 'twilio', capabilities: ['voice', 'sms', 'mms'], region: 'US-TX' },
  { id: 'pn3', number: '+1 (555) 345-6789', provider: 'callrail', capabilities: ['voice', 'tracking'], region: 'US-FL' },
  { id: 'pn4', number: '+1 (555) 456-7890', provider: 'callrail', capabilities: ['voice', 'sms', 'tracking'], region: 'US-NY' },
  { id: 'pn5', number: '+1 (555) 567-8901', provider: 'twilio', capabilities: ['voice'], region: 'US-WA' },
];

// Mock purchased/active phone numbers
const MOCK_ACTIVE_NUMBERS = [
  { id: 'act1', number: '+1 (555) 987-6543', provider: 'twilio', capabilities: ['voice', 'sms'], assignedTo: 'Sales Campaign', region: 'US-CA' },
  { id: 'act2', number: '+1 (555) 876-5432', provider: 'callrail', capabilities: ['voice', 'tracking'], assignedTo: 'Marketing', region: 'US-NY' },
];

export const PhoneNumberSelector = () => {
  const [activeNumbers, setActiveNumbers] = useState(MOCK_ACTIVE_NUMBERS);
  const [availableNumbers, setAvailableNumbers] = useState(MOCK_AVAILABLE_NUMBERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [searchRegion, setSearchRegion] = useState('US-CA');
  const [searchProvider, setSearchProvider] = useState('twilio');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Function to handle searching for new numbers
  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Numbers Retrieved",
        description: `Found ${availableNumbers.length} numbers in ${searchRegion}`,
      });
    }, 1500);
  };

  // Function to purchase/add a phone number
  const addPhoneNumber = (number: any) => {
    const newActiveNumber = {
      ...number,
      id: `active-${number.id}`,
      assignedTo: 'Unassigned',
    };
    
    setActiveNumbers([...activeNumbers, newActiveNumber]);
    
    // Remove from available numbers
    setAvailableNumbers(availableNumbers.filter(n => n.id !== number.id));
    
    toast({
      title: "Phone Number Added",
      description: `${number.number} has been added to your account.`,
    });
  };

  // Function to release a phone number
  const releasePhoneNumber = (id: string) => {
    setActiveNumbers(activeNumbers.filter(n => n.id !== id));
    
    toast({
      title: "Phone Number Released",
      description: "The phone number has been released from your account.",
    });
  };

  // Toggle selection of numbers
  const toggleSelectNumber = (id: string) => {
    if (selectedNumbers.includes(id)) {
      setSelectedNumbers(selectedNumbers.filter(numId => numId !== id));
    } else {
      setSelectedNumbers([...selectedNumbers, id]);
    }
  };

  // Render capabilities badges
  const renderCapabilities = (capabilities: string[]) => {
    return capabilities.map(cap => {
      let color: "default" | "secondary" | "destructive" | "outline" = "outline";
      if (cap === 'voice') color = "default";
      if (cap === 'sms') color = "secondary";
      
      return (
        <Badge key={cap} variant={color} className="mr-1 capitalize">
          {cap}
        </Badge>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Your Active Phone Numbers</h3>
        
        {activeNumbers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeNumbers.map((number) => (
                <TableRow key={number.id}>
                  <TableCell className="font-medium">{number.number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {number.provider}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {renderCapabilities(number.capabilities)}
                  </TableCell>
                  <TableCell>{number.assignedTo}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => releasePhoneNumber(number.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md text-muted-foreground">
            <Phone className="mx-auto h-12 w-12 opacity-20 mb-3" />
            <h3 className="text-lg font-medium mb-1">No Phone Numbers</h3>
            <p className="mb-4">You haven't added any phone numbers yet.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Add New Phone Numbers</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Search for Phone Numbers</DialogTitle>
              <DialogDescription>
                Search for available phone numbers from your configured providers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  value={searchProvider} 
                  onValueChange={setSearchProvider}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="callrail">CallRail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select 
                  value={searchRegion} 
                  onValueChange={setSearchRegion}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US-CA">California (US)</SelectItem>
                    <SelectItem value="US-NY">New York (US)</SelectItem>
                    <SelectItem value="US-TX">Texas (US)</SelectItem>
                    <SelectItem value="US-FL">Florida (US)</SelectItem>
                    <SelectItem value="US-WA">Washington (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                disabled={isSearching} 
                onClick={() => {
                  handleSearch();
                  setIsAddDialogOpen(false);
                }}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Search Numbers
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="mx-auto h-8 w-8 animate-spin opacity-70" />
          <p className="mt-2 text-muted-foreground">Loading available numbers...</p>
        </div>
      ) : availableNumbers.length > 0 ? (
        <div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableNumbers.map((number) => (
                  <TableRow key={number.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleSelectNumber(number.id)}
                      >
                        {selectedNumbers.includes(number.id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded-sm border" />
                        )}
                        <span className="sr-only">Select</span>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{number.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {number.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {renderCapabilities(number.capabilities)}
                    </TableCell>
                    <TableCell>{number.region}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPhoneNumber(number)}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between mt-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {selectedNumbers.length} selected
              </span>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
              
              <Button
                size="sm"
                disabled={selectedNumbers.length === 0}
                onClick={() => {
                  const numbersToAdd = availableNumbers.filter(n => selectedNumbers.includes(n.id));
                  numbersToAdd.forEach(number => addPhoneNumber(number));
                  setSelectedNumbers([]);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Selected
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12 opacity-20 mb-3" />
          <h3 className="text-lg font-medium mb-1">No Available Numbers</h3>
          <p className="mb-4">Click the search button to find available numbers.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Search for Numbers
          </Button>
        </div>
      )}
      
      <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Number Management</h4>
            <p className="text-sm mt-1">
              Adding phone numbers may incur charges from your service provider. Numbers added here will be available for use in campaigns and other features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
