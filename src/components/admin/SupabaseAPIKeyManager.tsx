
import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSupabaseCommunication } from '@/utils/supabaseCommunicationService';
import { DbCommunicationProvider, ProviderType } from '@/utils/supabaseClient';
import { 
  APIKeyForm, 
  APIKeyFormValues,
  APIKeyCard, 
  EmptyAPIKeyState,
  SecurityInfoBanner 
} from './apiKeys';

export const SupabaseAPIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<DbCommunicationProvider[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { getProviders, saveProvider, deleteProvider } = useSupabaseCommunication();

  // Load providers from Supabase
  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        const providers = await getProviders();
        setApiKeys(providers);
      } catch (error) {
        console.error('Error loading providers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load API keys from database',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, [getProviders, toast]);

  // Handle form submission
  const handleSubmit = async (values: APIKeyFormValues) => {
    try {
      const providerType = values.service as ProviderType;
      
      // Format the provider data based on service type
      const newProvider: Omit<DbCommunicationProvider, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
        name: values.name,
        type: providerType,
        is_default: false,
        config: {}
      };
      
      if (providerType === 'twilio') {
        newProvider.config = {
          accountSid: values.accountSid,
          authToken: values.apiSecret,
          twilioNumber: values.apiKey,
        };
      } else if (providerType === 'callrail') {
        newProvider.config = {
          apiKey: values.apiKey,
          accountId: values.accountSid,
        };
      }
      
      // Save to Supabase
      await saveProvider(newProvider);
      
      // Refresh the list
      const providers = await getProviders();
      setApiKeys(providers);
      
      setIsAddDialogOpen(false);
      
      toast({
        title: "API Key Added",
        description: `${values.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to save API key',
        variant: 'destructive'
      });
    }
  };

  // Delete an API key
  const handleDeleteApiKey = async (id: string) => {
    try {
      await deleteProvider(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast({
        title: "API Key Removed",
        description: "The API key has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your API Keys (Supabase)</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Key className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Enter the API key details for Twilio or CallRail.
              </DialogDescription>
            </DialogHeader>
            
            <APIKeyForm 
              onSubmit={handleSubmit} 
              onCancel={() => setIsAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading API keys...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {apiKeys.map((key) => (
              <APIKeyCard 
                key={key.id} 
                apiKey={key} 
                onDelete={handleDeleteApiKey} 
              />
            ))}
          </div>
          
          {apiKeys.length === 0 && (
            <EmptyAPIKeyState onAddClick={() => setIsAddDialogOpen(true)} />
          )}
        </>
      )}
      
      <SecurityInfoBanner />
    </div>
  );
};
