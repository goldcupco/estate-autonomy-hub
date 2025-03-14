
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, User, ArrowLeft, PhoneCall, MessageSquare, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar, { toggleSidebar } from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import CallList from '@/components/calls/CallList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  startCallRecording, 
  endCallRecording, 
  logSmsMessage,
  getSmsHistory
} from '@/utils/communicationUtils';

const Calls = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickCallDialogOpen, setQuickCallDialogOpen] = useState(false);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<number | null>(null);
  const { toast } = useToast();

  // Subscribe to global sidebar state changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  // On mount, initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  }, []);

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

  const toggleCallRecording = () => {
    if (isRecording) {
      // Stop recording
      if (currentCallId && callStartTime) {
        const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
        try {
          const callRecord = endCallRecording(currentCallId, duration);
          
          toast({
            title: "Call recorded",
            description: `Call recording saved (${formatCallDuration(duration)})`,
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
        const callId = startCallRecording(phoneNumber, 'Quick Call');
        setCurrentCallId(callId);
        setCallStartTime(new Date());
        setIsRecording(true);
        
        toast({
          title: "Recording started",
          description: `Recording call to ${phoneNumber}`,
        });
      } catch (error) {
        console.error('Error starting call recording:', error);
        toast({
          title: "Recording failed",
          description: "Failed to start call recording",
          variant: "destructive"
        });
      }
    }
  };

  const handleQuickCall = () => {
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
      setQuickCallDialogOpen(false);
      setPhoneNumber('');
    }
  };
  
  const handleQuickSms = () => {
    if (!smsRecipient || !smsText) {
      toast({
        title: "Missing information",
        description: "Please enter a recipient and message.",
        variant: "destructive"
      });
      return;
    }
    
    // Log the SMS
    try {
      const smsRecord = logSmsMessage(
        smsRecipient, 
        smsText, 
        'outgoing',
        'Quick SMS Recipient'
      );
      
      toast({
        title: "SMS sent and logged",
        description: `Message sent to ${smsRecipient}`,
      });
    } catch (error) {
      console.error('Error logging SMS:', error);
      toast({
        title: "Error logging SMS",
        description: "Message sent but could not be logged",
        variant: "destructive"
      });
    }
    
    setQuickSmsDialogOpen(false);
    setSmsRecipient('');
    setSmsText('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => toggleSidebar()} />
        
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link to="/">Home</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <Link to="/dashboard">Dashboard</Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Calls</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Call Management</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setQuickCallDialogOpen(true)}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Quick Call
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickSmsDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Quick SMS
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Scheduled Calls Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Scheduled</h2>
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-muted-foreground">Upcoming calls</p>
            </div>
            
            {/* Completed Calls Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Completed</h2>
                <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">28</p>
              <p className="text-muted-foreground">Calls this week</p>
            </div>
            
            {/* Contacts Card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Contacts</h2>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                  <User className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">45</p>
              <p className="text-muted-foreground">Active contacts</p>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <CallList />
          </div>
        </main>
      </div>
      
      {/* Quick Call Dialog */}
      <Dialog open={quickCallDialogOpen} onOpenChange={(open) => {
        // Only allow closing if not recording
        if (!isRecording || !open) {
          setQuickCallDialogOpen(open);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Quick Call</DialogTitle>
            <DialogDescription>
              Calls can be recorded for quality and training purposes.
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
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant={isRecording ? "destructive" : "outline"} 
              onClick={toggleCallRecording}
              className="gap-1"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Record Call"}
            </Button>
            
            <div className="flex gap-2">
              {!isRecording && (
                <Button variant="outline" onClick={() => setQuickCallDialogOpen(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleQuickCall}>
                Call Now
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Quick SMS Dialog */}
      <Dialog open={quickSmsDialogOpen} onOpenChange={setQuickSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Quick SMS</DialogTitle>
            <DialogDescription>
              SMS messages are logged for future reference.
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
              <label htmlFor="quickSmsText" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="quickSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickSmsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickSms}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calls;
