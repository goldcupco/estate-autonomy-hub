
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MLS_PROVIDERS } from './mlsConstants';
import { simulateMLSApiImport } from './mlsUtils';

interface MLSApiImporterProps {
  onImportSuccess?: (properties: any[]) => void;
}

export function MLSApiImporter({ onImportSuccess }: MLSApiImporterProps) {
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
    
    try {
      const importedProperties = await simulateMLSApiImport(provider);
      
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

  return (
    <>
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
    </>
  );
}
