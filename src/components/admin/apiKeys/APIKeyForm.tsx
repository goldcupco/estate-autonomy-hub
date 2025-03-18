
import { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogFooter,
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
import { ProviderType } from '@/utils/supabaseClient';

// Define validation schema for API keys
const apiKeySchema = z.object({
  service: z.enum(['twilio', 'callrail']),
  name: z.string().min(1, "Name is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().optional(),
  accountSid: z.string().optional(),
});

export type APIKeyFormValues = z.infer<typeof apiKeySchema>;

interface APIKeyFormProps {
  onSubmit: (values: APIKeyFormValues) => Promise<void>;
  onCancel: () => void;
}

export const APIKeyForm = ({ onSubmit, onCancel }: APIKeyFormProps) => {
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

  const handleSubmit = async (values: APIKeyFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
        
        {form.watch('service') === 'twilio' ? (
          <>
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
            
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="•••••••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twilio Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter in E.164 format (e.g., +1234567890)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Your CallRail API Key" {...field} />
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
                  <FormLabel>Account ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Your CallRail Account ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <DialogFooter className="pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save API Key</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
