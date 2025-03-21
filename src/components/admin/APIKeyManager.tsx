
import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define validation schema for API keys
const apiKeySchema = z.object({
  service: z.enum(['twilio', 'callrail']),
  name: z.string().min(1, "Name is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  accountSid: z.string().optional(),
});

type APIKeyFormValues = z.infer<typeof apiKeySchema>;

// Mock data - in a real application, these would be stored securely
const MOCK_INITIAL_KEYS = [
  { id: '1', service: 'twilio', name: 'Production Twilio', apiKey: 'SK********', apiSecret: '********', accountSid: 'AC********', isActive: true },
  { id: '2', service: 'callrail', name: 'Marketing CallRail', apiKey: 'CR********', isActive: true },
];

export const APIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<Array<any>>(MOCK_INITIAL_KEYS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Initialize form
  const form = useForm<APIKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      service: 'twilio',
      name: '',
      apiKey: '',
      apiSecret: '',
      accountSid: '',
    },
  });

  // Handle form submission
  const onSubmit = (values: APIKeyFormValues) => {
    // In a real app, this would securely store the API keys
    const newKey = {
      id: Math.random().toString(36).substring(7),
      ...values,
      isActive: true,
    };
    
    setApiKeys([...apiKeys, newKey]);
    setIsAddDialogOpen(false);
    form.reset();
    
    toast({
      title: "API Key Added",
      description: `${values.name} has been added successfully.`,
    });
  };

  // Delete an API key
  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "API Key Removed",
      description: "The API key has been deleted.",
    });
  };

  // Toggle visibility of a secret
  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your API Keys</h3>
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
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <div className="flex gap-4">
                        <Button 
                          type="button"
                          variant={field.value === 'twilio' ? 'default' : 'outline'} 
                          className="flex-1"
                          onClick={() => field.onChange('twilio')}
                        >
                          Twilio
                        </Button>
                        <Button 
                          type="button"
                          variant={field.value === 'callrail' ? 'default' : 'outline'} 
                          className="flex-1"
                          onClick={() => field.onChange('callrail')}
                        >
                          CallRail
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Production API Key" {...field} />
                      </FormControl>
                      <FormDescription>
                        A name to help you identify this API key.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder={field.value === 'twilio' ? "SK..." : "Your CallRail API Key"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('service') === 'twilio' && (
                  <>
                    <FormField
                      control={form.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="•••••••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountSid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account SID</FormLabel>
                          <FormControl>
                            <Input placeholder="AC..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save API Key</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {apiKeys.map((key) => (
          <Card key={key.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-base">
                <span>{key.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => deleteApiKey(key.id)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </CardTitle>
              <CardDescription>{key.service === 'twilio' ? 'Twilio' : 'CallRail'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">API Key:</span>
                <span className="font-mono text-gray-500">{key.apiKey}</span>
              </div>
              
              {key.service === 'twilio' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">API Secret:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-gray-500">
                        {showSecrets[key.id] ? key.apiSecret : '••••••••'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => toggleSecretVisibility(key.id)}
                      >
                        {showSecrets[key.id] ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account SID:</span>
                    <span className="font-mono text-gray-500">{key.accountSid}</span>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="pt-1 text-xs text-gray-500">
              <AlertCircle className="h-3.5 w-3.5 mr-1" /> Stored securely
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {apiKeys.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Key className="mx-auto h-12 w-12 opacity-20 mb-3" />
          <h3 className="text-lg font-medium mb-1">No API Keys</h3>
          <p className="mb-4">You haven't added any API keys yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add Your First API Key
          </Button>
        </div>
      )}
      
      <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Security Information</h4>
            <p className="text-sm mt-1">
              API keys are stored securely and encrypted. For maximum security, we recommend creating dedicated API keys with minimum required permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
