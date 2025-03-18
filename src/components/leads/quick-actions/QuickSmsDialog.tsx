
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCommunication } from '@/utils/communicationService';
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseSpintax, validateSpintax } from '@/utils/spintaxUtils';

interface QuickSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSmsDialog({ open, onOpenChange }: QuickSmsDialogProps) {
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [useSpintax, setUseSpintax] = useState(false);
  const [spintaxError, setSpintaxError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { sendSms, getProviders } = useCommunication();
  const [hasProvider, setHasProvider] = useState(false);

  // Check if user has configured SMS providers
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const providers = await getProviders();
        setHasProvider(providers.length > 0);
      } catch (error) {
        console.error('Error checking providers:', error);
        setHasProvider(false);
      }
    };

    if (open) {
      checkProviders();
    }
  }, [open, getProviders]);

  const validateSmsText = (text: string): boolean => {
    if (!text.trim()) {
      toast({
        title: "Missing message",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return false;
    }
    
    if (useSpintax) {
      const validation = validateSpintax(text);
      if (!validation.isValid) {
        setSpintaxError(validation.error);
        toast({
          title: "Spintax error",
          description: validation.error,
          variant: "destructive"
        });
        return false;
      }
    }
    
    setSpintaxError(null);
    return true;
  };

  const handleQuickSms = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!smsRecipient || !smsText) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and message.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateSmsText(smsText)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Process spintax if enabled
      const processedText = useSpintax ? parseSpintax(smsText) : smsText;
      
      // Get the first provider (in a real app, you'd let users choose)
      const providers = await getProviders();
      if (providers.length === 0) {
        throw new Error("No SMS provider configured");
      }
      
      // Send the SMS using the first provider
      const providerId = providers[0].id;
      await sendSms(providerId, smsRecipient, processedText, recipientName || undefined);
      
      toast({
        title: "SMS sent",
        description: `Message sent to ${smsRecipient}`,
      });
      
      // Reset the form
      setSmsRecipient('');
      setSmsText('');
      setRecipientName('');
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error sending SMS",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a Quick SMS</DialogTitle>
          <DialogDescription>
            {hasProvider 
              ? "Send SMS directly from the application" 
              : "Configure an SMS provider in Settings to enable full SMS functionality"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="smsRecipient" className="text-sm font-medium">
              Recipient Phone Number
            </label>
            <Input
              id="smsRecipient"
              value={smsRecipient}
              onChange={(e) => setSmsRecipient(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="recipientName" className="text-sm font-medium">
              Recipient Name (Optional)
            </label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="John Smith"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="quickSmsText" className="text-sm font-medium">
                Message
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Spintax</span>
                <Switch 
                  checked={useSpintax} 
                  onCheckedChange={setUseSpintax} 
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-muted-foreground cursor-help">
                        <AlertCircle size={16} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Spintax allows you to create message variations.</p>
                      <p className="mt-1">Example: {"{Hi|Hello}"}, I am getting in touch about your {"{property|land|acreage}"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Textarea
              id="quickSmsText"
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder={useSpintax 
                ? "{Hi|Hello}, I am getting in touch about your {property|land|acreage}" 
                : "Type your message here..."
              }
              className="min-h-[120px]"
            />
            {spintaxError && (
              <p className="text-sm text-red-500">{spintaxError}</p>
            )}
            {useSpintax && !spintaxError && (
              <p className="text-xs text-muted-foreground">
                Use {"{"}option1|option2|option3{"}"} format for text variations
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleQuickSms} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
