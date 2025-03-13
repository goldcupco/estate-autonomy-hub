
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataUploader } from '@/components/ui/DataUploader';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MLSImporterProps {
  onImportSuccess?: (properties: any[]) => void;
}

// Sample MLS providers - this would be expanded in a real implementation
const MLS_PROVIDERS = [
  { id: 'rets', name: 'RETS MLS' },
  { id: 'trestle', name: 'Trestle' },
  { id: 'crmls', name: 'CRMLS' },
  { id: 'bright', name: 'Bright MLS' },
  { id: 'stellar', name: 'Stellar MLS' },
  { id: 'nwmls', name: 'NWMLS' }
];

export function MLSImporter({ onImportSuccess }: MLSImporterProps) {
  const [activeTab, setActiveTab] = useState('api');
  const [provider, setProvider] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    apiUrl: '',
    apiKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnect = async () => {
    setIsLoading(true);
    
    // This would actually connect to the MLS API in a real implementation
    // For demo purposes, we'll simulate an API call with a timeout
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample property data (would come from the MLS API in a real implementation)
      const importedProperties = Array(Math.floor(Math.random() * 10) + 5)
        .fill(null)
        .map((_, index) => ({
          id: `imported-${Date.now()}-${index}`,
          address: `${1000 + index} MLS Import Street`,
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          price: 500000 + (Math.random() * 1000000),
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 3) + 1,
          sqft: Math.floor(Math.random() * 2000) + 800,
          status: ['For Sale', 'Pending', 'Sold'][Math.floor(Math.random() * 3)] as 'For Sale' | 'Pending' | 'Sold',
          imageUrl: `https://images.unsplash.com/photo-${1568605114967 + index}-8130f3a36994`
        }));

      if (onImportSuccess) {
        onImportSuccess(importedProperties);
      }
      
      toast.success(`Successfully connected to ${provider} MLS`);
    } catch (error) {
      console.error('Error connecting to MLS:', error);
      toast.error('Failed to connect to MLS. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = (data: any[]) => {
    if (onImportSuccess) {
      onImportSuccess(data);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api">MLS API</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="mls-provider">MLS Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger id="mls-provider">
                <SelectValue placeholder="Select MLS provider" />
              </SelectTrigger>
              <SelectContent>
                {MLS_PROVIDERS.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mls-username">Username</Label>
            <Input 
              id="mls-username"
              value={credentials.username}
              onChange={e => handleCredentialChange('username', e.target.value)}
              placeholder="MLS Username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mls-password">Password</Label>
            <Input 
              id="mls-password"
              type="password"
              value={credentials.password}
              onChange={e => handleCredentialChange('password', e.target.value)}
              placeholder="MLS Password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mls-url">API URL</Label>
            <Input 
              id="mls-url"
              value={credentials.apiUrl}
              onChange={e => handleCredentialChange('apiUrl', e.target.value)}
              placeholder="https://api.mlsprovider.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mls-key">API Key (if required)</Label>
            <Input 
              id="mls-key"
              value={credentials.apiKey}
              onChange={e => handleCredentialChange('apiKey', e.target.value)}
              placeholder="Your API key"
            />
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleConnect}
            disabled={isLoading || !provider || !credentials.username || !credentials.password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect & Import'
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="csv" className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground mb-4">
            If you have a CSV export from your MLS system, you can upload it here.
            Make sure it includes columns for address, city, state, zip, price, beds, baths, and square footage.
          </div>
          
          <DataUploader 
            title="Upload MLS CSV Data"
            description="Upload a CSV file exported from your MLS system"
            acceptedFileTypes=".csv"
            onUploadComplete={handleCSVUpload}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
