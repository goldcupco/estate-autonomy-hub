
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mic, MicOff } from 'lucide-react';
import { useCommunication } from '@/utils/communicationService';

interface QuickCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCallDialog({ open, onOpenChange }: QuickCallDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<number | null>(null);
  
  const { toast } = useToast();
  const { makeCall, endCall, hasConfiguredCallProvider } = useCommunication();

  // Timer for call duration
  useEffect(() => {
    if (isRecording && callStartTime) {
      const intervalId = window.setInterval(() => {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
      
      setCallTimerInterval(intervalId);
      
      return () => {
        window.clearInterval(intervalId);
      };
    } else if (callTimerInterval) {
      window.clearInterval(callTimerInterval);
      setCallTimerInterval(null);
    }
  }, [isRecording, callStartTime]);

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCallRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRecording) {
      // Stop recording
      if (currentCallId && callStartTime) {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        try {
          endCall(currentCallId, duration)
            .then(callRecord => {
              toast({
                title: "Call recorded",
                description: `Call recording saved (${formatCallDuration(duration)})`,
              });
            })
            .catch(error => {
              console.error('Error ending call recording:', error);
            });
        } catch (error) {
          console.error('Error ending call recording:', error);
        }
      }
      setIsRecording(false);
      setCurrentCallId(null);
      setCallStartTime(null);
      setCallDuration(0);
    } else {
      // Start recording
      if (!phoneNumber) {
        toast({
          title: "Missing information",
          description: "Please enter a phone number to record.",
          variant: "destructive"
        });
        return;
      }
      
      try {
        makeCall(phoneNumber, 'Quick Call')
          .then(callId => {
            setCurrentCallId(callId);
            setCallStartTime(new Date());
            setIsRecording(true);
            
            toast({
              title: "Recording started",
              description: `Recording call to ${phoneNumber}`,
            });
          })
          .catch(error => {
            console.error('Error starting call recording:', error);
            toast({
              title: "Recording failed",
              description: "Failed to start call recording",
              variant: "destructive"
            });
          });
      } catch (error) {
        console.error('Error starting call recording:', error);
      }
    }
  };

  const handleQuickCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!phoneNumber) {
      toast({
        title: "Missing information",
        description: "Please enter a phone number.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would integrate with a phone API
    window.location.href = `tel:${phoneNumber}`;
    
    toast({
      title: "Initiating call",
      description: `Calling ${phoneNumber}`,
    });
    
    // Don't close the dialog if recording is active
    if (!isRecording) {
      onOpenChange(false);
      setPhoneNumber('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Only allow closing if not recording
      if (!isRecording || !newOpen) {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Make a Quick Call</DialogTitle>
          <DialogDescription>
            {hasConfiguredCallProvider() 
              ? "Calls can be recorded for quality and training purposes." 
              : "Call recording is available once you configure a call provider in Settings."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(555) 123-4567"
              type="tel"
              disabled={isRecording}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {isRecording && (
            <div className="p-3 border rounded-md bg-red-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-medium text-red-700">Recording: {formatCallDuration(callDuration)}</span>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant={isRecording ? "destructive" : "outline"} 
            onClick={toggleCallRecording}
            className="gap-1"
            disabled={!hasConfiguredCallProvider() && !isRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Record Call"}
          </Button>
          
          <div className="flex gap-2">
            {!isRecording && (
              <Button variant="outline" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenChange(false);
              }}>
                Cancel
              </Button>
            )}
            <Button onClick={handleQuickCall}>
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
