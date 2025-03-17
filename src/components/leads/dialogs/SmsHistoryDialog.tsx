
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Lead } from '../types';
import { SmsRecord } from '@/utils/communicationUtils';
import { toast } from "sonner";

interface SmsHistoryDialogProps {
  lead: Lead;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  smsHistory: SmsRecord[];
}

export function SmsHistoryDialog({ 
  lead,
  isOpen, 
  onOpenChange,
  smsHistory
}: SmsHistoryDialogProps) {
  const navigate = useNavigate();

  const handleNavigateToLead = (contactName: string) => {
    // Navigate to the Leads page
    navigate('/leads');
    onOpenChange(false);
    
    // Show a toast to indicate navigation
    toast.info(`Navigating to ${contactName}`);
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>SMS History with {lead.name}</DialogTitle>
      </DialogHeader>
      
      <div className="py-4 max-h-[400px] overflow-y-auto">
        {smsHistory.length > 0 ? (
          <div className="space-y-4">
            {smsHistory.map((sms) => (
              <div 
                key={sms.id} 
                className={`p-3 rounded-lg ${
                  sms.direction === 'outgoing' 
                    ? 'bg-blue-100 ml-8' 
                    : 'bg-gray-100 mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <Badge variant={sms.direction === 'outgoing' ? 'default' : 'outline'}>
                    {sms.direction === 'outgoing' ? 'Sent' : 'Received'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sms.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">{sms.message}</p>
                  {sms.contactName && sms.direction === 'outgoing' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 h-7 flex items-center gap-1"
                      onClick={() => handleNavigateToLead(sms.contactName || '')}
                    >
                      View Contact
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No SMS history found for this contact.
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
