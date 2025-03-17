
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from '../types';
import { SmsRecord } from '@/utils/communicationUtils';

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
                <p className="text-sm">{sms.message}</p>
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
