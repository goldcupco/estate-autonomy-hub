
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
import { DbCommunicationProvider, ProviderType, supabase } from '@/utils/supabaseClient';
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
        // First try direct method from service
        try {
          const providers = await getProviders();
          setApiKeys(providers);
          return;
        } catch (serviceError) {
          console.warn('Could not load providers through service, falling back to direct query', serviceError);
        }
        
        // Fallback to direct query if the service fails
        const { data, error } = await supabase
          .from('communication_providers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setApiKeys(data || []);
      } catch (error) {
        console.error('Error loading providers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load API keys from database',
          variant: 'destructive'
        });
        // Set empty array so UI doesn't stay in loading state forever
        setApiKeys([]);
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
      
      // Try the service first
      try {
        // Save to Supabase
        await saveProvider(newProvider);
        
        // Refresh the list
        const providers = await getProviders();
        setApiKeys(providers);
      } catch (serviceError) {
        console.warn('Service method failed, trying direct DB insert', serviceError);
        
        // Fallback to direct insert
        const { data, error } = await supabase
          .from('communication_providers')
          .insert({
            ...newProvider,
            user_id: 'system' // In a real app, this would be the current user's ID
          })
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add the new key to state
          setApiKeys([data[0], ...apiKeys]);
        }
      }
      
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
      // Try the service first
      try {
        await deleteProvider(id);
      } catch (serviceError) {
        console.warn('Service delete failed, trying direct DB delete', serviceError);
        
        // Fallback to direct delete
        const { error } = await supabase
          .from('communication_providers')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Update UI immediately
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
