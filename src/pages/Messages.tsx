
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Users, ArrowLeft, Phone, Send, MessageCircle, AlertCircle, Hourglass, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { toggleSidebar } from '@/utils/sidebarUtils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch,
} from "@/components/ui/switch";
import {
  Slider,
} from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { logSmsMessage, getSmsHistory, SmsRecord } from '@/utils/communicationUtils';
import { parseSpintax, validateSpintax, getRandomDelay } from '@/utils/spintaxUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Messages = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quickSmsDialogOpen, setQuickSmsDialogOpen] = useState(false);
  const [bulkSmsDialogOpen, setBulkSmsDialogOpen] = useState(false);
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const [bulkRecipientType, setBulkRecipientType] = useState('all-leads');
  const [recipientCount, setRecipientCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState<SmsRecord[]>([]);
  const [messageTemplates] = useState([
    { 
      id: 'intro', 
      name: 'Introduction', 
      text: '{Hi|Hello}, this is Jane from RealEstate Pro. I am getting in touch to discuss a possible offer on your {property|land|acreage} at [ADDRESS].' 
    },
    { 
      id: 'follow-up', 
      name: 'Follow-up', 
      text: 'Just following up on our conversation about [PROPERTY]. Let me know if you have any questions or would like to schedule a viewing.' 
    },
    { 
      id: 'reminder', 
      name: 'Appointment Reminder', 
      text: 'This is a reminder about your appointment tomorrow at [TIME]. Looking forward to meeting with you!' 
    }
  ]);
  const [useSpintax, setUseSpintax] = useState(false);
  const [useDistributedSending, setUseDistributedSending] = useState(false);
  const [delayRange, setDelayRange] = useState<[number, number]>([2, 10]);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [spintaxError, setSpintaxError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setSidebarOpen(e.detail);
    };
    
    window.addEventListener('sidebarStateChange' as any, handler);
    return () => {
      window.removeEventListener('sidebarStateChange' as any, handler);
    };
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
    
    // Fix: Provide a default phone number to getSmsHistory
    const history = getSmsHistory('(555) 123-4567');
    setMessageHistory(history);
  }, []);

  useEffect(() => {
    switch (bulkRecipientType) {
      case 'all-leads':
        setRecipientCount(124);
        break;
      case 'new-leads':
        setRecipientCount(32);
        break;
      case 'qualified-leads':
        setRecipientCount(48);
        break;
      case 'recent-contacts':
        setRecipientCount(18);
        break;
      default:
        setRecipientCount(0);
    }
  }, [bulkRecipientType]);

  const validateSmsText = (text: string): boolean => {
    if (!text.trim()) {
      toast.error('Please enter a message');
      return false;
    }
    
    if (useSpintax) {
      const validation = validateSpintax(text);
      if (!validation.isValid) {
        setSpintaxError(validation.error);
        toast.error(`Spintax error: ${validation.error}`);
        return false;
      }
    }
    
    setSpintaxError(null);
    return true;
  };

  const handleQuickSms = () => {
    if (!smsRecipient || !smsText) {
      toast.error('Please enter a recipient and message');
      return;
    }
    
    if (!validateSmsText(smsText)) {
      return;
    }
    
    const processedText = useSpintax ? parseSpintax(smsText) : smsText;
    
    try {
      const smsRecord = logSmsMessage(
        smsRecipient, 
        processedText, 
        'outgoing',
        'Quick SMS Recipient'
      );
      
      setMessageHistory(prev => [smsRecord, ...prev]);
      
      toast.success(`Message sent to ${smsRecipient}`);
    } catch (error) {
      console.error('Error logging SMS:', error);
      toast.error('Message sent but could not be logged');
    }
    
    setQuickSmsDialogOpen(false);
    setSmsRecipient('');
    setSmsText('');
  };

  const handleBulkSms = async () => {
    if (!smsText) {
      toast.error('Please enter a message');
      return;
    }
    
    if (!validateSmsText(smsText)) {
      return;
    }
    
    if (recipientCount <= 0) {
      toast.error('No recipients selected');
      return;
    }
    
    const sampleRecipients = [
      { phone: '(555) 111-2222', name: 'John Smith' },
      { phone: '(555) 333-4444', name: 'Mary Johnson' },
      { phone: '(555) 555-6666', name: 'Robert Davis' },
      { phone: '(555) 777-8888', name: 'Sarah Wilson' },
      { phone: '(555) 999-0000', name: 'Michael Brown' }
    ];
    
    if (useDistributedSending) {
      setIsSending(true);
      setSendProgress({ current: 0, total: sampleRecipients.length });
      
      let newHistory: SmsRecord[] = [];
      
      for (let i = 0; i < sampleRecipients.length; i++) {
        const recipient = sampleRecipients[i];
        
        const processedText = useSpintax ? parseSpintax(smsText) : smsText;
        
        const delay = getRandomDelay(delayRange[0], delayRange[1]);
        
        setSendProgress(prev => ({ ...prev, current: i }));
        
        toast.info(`Sending to ${recipient.name}...`, {
          duration: delay,
          icon: <Hourglass className="h-4 w-4 animate-spin" />
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          const smsRecord = logSmsMessage(
            recipient.phone,
            processedText,
            'outgoing',
            recipient.name
          );
          newHistory.push(smsRecord);
          
          toast.success(`Sent to ${recipient.name}`);
        } catch (error) {
          console.error(`Error logging SMS to ${recipient.name}:`, error);
          toast.error(`Failed to send to ${recipient.name}`);
        }
      }
      
      setMessageHistory(prev => [...newHistory, ...prev]);
      setIsSending(false);
      
      toast.success(`Bulk message sent to ${sampleRecipients.length} recipients`);
    } else {
      let newHistory: SmsRecord[] = [];
      
      sampleRecipients.forEach(recipient => {
        const processedText = useSpintax ? parseSpintax(smsText) : smsText;
        
        try {
          const smsRecord = logSmsMessage(
            recipient.phone,
            processedText,
            'outgoing',
            recipient.name
          );
          newHistory.push(smsRecord);
        } catch (error) {
          console.error(`Error logging SMS to ${recipient.name}:`, error);
        }
      });
      
      setMessageHistory(prev => [...newHistory, ...prev]);
      
      toast.success(`Bulk message sent to ${recipientCount} recipients`);
    }
    
    setBulkSmsDialogOpen(false);
    setSmsText('');
    setBulkRecipientType('all-leads');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setSmsText(template.text);
    }
  };

  const handleNavigateToLead = (contactName: string) => {
    navigate(`/leads?search=${encodeURIComponent(contactName)}`);
    toast.info(`Navigating to ${contactName}`);
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
                  <BreadcrumbPage>Messages</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Message Management</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setQuickSmsDialogOpen(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Quick SMS
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBulkSmsDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Bulk SMS
              </Button>
              <Link to="/calls">
                <Button variant="outline" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Go to Calls
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Messages Sent</h2>
                <div className="p-2 bg-primary/10 text-primary rounded-full">
                  <Send className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">{messageHistory.filter(m => m.direction === 'outgoing').length}</p>
              <p className="text-muted-foreground">Total messages sent</p>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Response Rate</h2>
                <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">68%</p>
              <p className="text-muted-foreground">Average response rate</p>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recipients</h2>
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">124</p>
              <p className="text-muted-foreground">Active recipients</p>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Message History</h2>
            
            {messageHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>No messages yet. Send your first message to get started.</p>
              </div>
            ) : (
              <div className="divide-y">
                {messageHistory.map((message) => (
                  <div 
                    key={message.id} 
                    className={`py-4 flex gap-4 ${
                      message.direction === 'outgoing' ? 'pl-4' : 'pl-0'
                    }`}
                  >
                    <div 
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.direction === 'outgoing' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'
                      }`}
                    >
                      {message.direction === 'outgoing' ? (
                        <Send className="h-5 w-5" />
                      ) : (
                        <MessageCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        {message.contactName ? (
                          <Button 
                            variant="link" 
                            className="font-medium p-0 h-auto flex items-center gap-1 text-primary" 
                            onClick={() => handleNavigateToLead(message.contactName || '')}
                          >
                            {message.contactName}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        ) : (
                          <h3 className="font-medium">{message.phoneNumber}</h3>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
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
                        <p className="mt-1">Example: Hello {"{"}name|friend|there{"}"}, how are you?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Textarea
                id="quickSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder={useSpintax ? "Hi {there|friend}, how {are you|is it going}?" : "Type your message here..."}
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Message Templates
              </label>
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      
      <Dialog open={bulkSmsDialogOpen} onOpenChange={setBulkSmsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Bulk SMS</DialogTitle>
            <DialogDescription>
              Send a message to multiple recipients at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="bulkRecipientType" className="text-sm font-medium">
                Recipients
              </label>
              <Select value={bulkRecipientType} onValueChange={setBulkRecipientType}>
                <SelectTrigger id="bulkRecipientType">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-leads">All Leads (124)</SelectItem>
                  <SelectItem value="new-leads">New Leads (32)</SelectItem>
                  <SelectItem value="qualified-leads">Qualified Leads (48)</SelectItem>
                  <SelectItem value="recent-contacts">Recent Contacts (18)</SelectItem>
                </SelectContent>
              </Select>
              
              <p className="text-sm text-muted-foreground mt-2">
                This message will be sent to <span className="font-semibold">{recipientCount}</span> recipients.
              </p>
            </div>
            
            <Accordion type="single" collapsible>
              <AccordionItem value="sending-options">
                <AccordionTrigger>Advanced Sending Options</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Spintax Formatting</label>
                        <p className="text-xs text-muted-foreground">
                          Create unique messages for each recipient
                        </p>
                      </div>
                      <Switch 
                        checked={useSpintax} 
                        onCheckedChange={setUseSpintax} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Distributed Sending</label>
                        <p className="text-xs text-muted-foreground">
                          Send messages with random delays
                        </p>
                      </div>
                      <Switch 
                        checked={useDistributedSending} 
                        onCheckedChange={setUseDistributedSending} 
                      />
                    </div>
                    
                    {useDistributedSending && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Delay Range (seconds)</label>
                          <span className="text-sm text-muted-foreground">
                            {delayRange[0]} - {delayRange[1]} sec
                          </span>
                        </div>
                        <Slider
                          value={delayRange}
                          min={1}
                          max={30}
                          step={1}
                          onValueChange={setDelayRange as (value: number[]) => void}
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="bulkSmsText" className="text-sm font-medium">
                  Message
                </label>
                {useSpintax && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-muted-foreground cursor-help">
                          <AlertCircle size={16} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Spintax format: Hello {"{"}name|friend|there{"}"}, how are you?</p>
                        <p className="mt-1">This will randomly select one option for each recipient.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Textarea
                id="bulkSmsText"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder={useSpintax ? "Hi {there|friend}, how {are you|is it going}?" : "Type your message here..."}
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
              <p className="text-xs text-muted-foreground">
                Character count: {smsText.length} / 160
                {smsText.length > 160 && " (will be sent as multiple messages)"}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Message Templates
              </label>
              <Select onValueChange={handleApplyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSmsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkSms}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Hourglass className="mr-2 h-4 w-4 animate-spin" />
                  Sending ({sendProgress.current + 1}/{sendProgress.total})
                </>
              ) : (
                `Send to ${recipientCount} Recipients`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
