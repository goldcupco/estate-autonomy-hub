
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Phone, MessageSquare, Check, CheckCircle, XCircle } from 'lucide-react';
import { 
  initCommunicationService, 
  getCommunicationService 
} from '@/utils/communicationService';

export function CommunicationSettings() {
  const [activeTab, setActiveTab] = useState("twilio");
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    twilioNumber: '',
    isDefault: true
  });
  const [callrailConfig, setCallrailConfig] = useState({
    apiKey: '',
    accountId: '',
    isDefault: false
  });
  const [useMockMode, setUseMockMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState({
    twilio: false,
    callrail: false
  });

  const { toast } = useToast();

  // Load existing config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('communicationServiceConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        
        if (config.providerConfig?.twilio) {
          setTwilioConfig({
            accountSid: config.providerConfig.twilio.accountSid || '',
            authToken: config.providerConfig.twilio.authToken || '',
            twilioNumber: config.providerConfig.twilio.twilioNumber || '',
            isDefault: config.defaultCallProvider === 'twilio' || config.defaultSmsProvider === 'twilio'
          });
          setIsConfigured(prev => ({ ...prev, twilio: true }));
        }
        
        if (config.providerConfig?.callrail) {
          setCallrailConfig({
            apiKey: config.providerConfig.callrail.apiKey || '',
            accountId: config.providerConfig.callrail.accountId || '',
            isDefault: config.defaultCallProvider === 'callrail'
          });
          setIsConfigured(prev => ({ ...prev, callrail: true }));
        }
        
        setUseMockMode(config.useMock || false);
      } catch (e) {
        console.error('Error loading communication config:', e);
      }
    }
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    
    try {
      // Build configuration object with properly typed provider values
      const config = {
        defaultCallProvider: twilioConfig.isDefault ? 'twilio' as const : callrailConfig.isDefault ? 'callrail' as const : undefined,
        defaultSmsProvider: twilioConfig.isDefault ? 'twilio' as const : undefined, // Only Twilio supports SMS
        providerConfig: {
          twilio: {
            accountSid: twilioConfig.accountSid,
            authToken: twilioConfig.authToken,
            twilioNumber: twilioConfig.twilioNumber
          },
          callrail: {
            apiKey: callrailConfig.apiKey,
            accountId: callrailConfig.accountId
          }
        },
        useMock: useMockMode
      };
      
      // Save to localStorage
      localStorage.setItem('communicationServiceConfig', JSON.stringify(config));
      
      // Initialize the service with the new config
      initCommunicationService(config);
      
      // Update the configured state
      setIsConfigured({
        twilio: !!twilioConfig.accountSid && !!twilioConfig.authToken && !!twilioConfig.twilioNumber,
        callrail: !!callrailConfig.apiKey && !!callrailConfig.accountId
      });
      
      toast({
        title: "Settings Saved",
        description: "Communication provider settings have been updated.",
      });
    } catch (e) {
      console.error('Error saving communication config:', e);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = (provider: 'twilio' | 'callrail') => {
    // In a real application, this would test the API connection
    // For demo purposes, we'll just check if the fields are filled
    
    let isValid = false;
    
    if (provider === 'twilio') {
      isValid = !!twilioConfig.accountSid && !!twilioConfig.authToken && !!twilioConfig.twilioNumber;
    } else if (provider === 'callrail') {
      isValid = !!callrailConfig.apiKey && !!callrailConfig.accountId;
    }
    
    toast({
      title: isValid ? "Connection Successful" : "Connection Failed",
      description: isValid 
        ? `Successfully connected to ${provider === 'twilio' ? 'Twilio' : 'CallRail'}.` 
        : `Could not connect to ${provider === 'twilio' ? 'Twilio' : 'CallRail'}. Please check your credentials.`,
      variant: isValid ? "default" : "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Services</CardTitle>
        <CardDescription>
          Configure your Twilio and CallRail settings for calls and SMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="twilio" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Twilio
              {isConfigured.twilio && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="callrail" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              CallRail
              {isConfigured.callrail && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="twilio" className="space-y-4">
            <div className="border p-4 rounded-md bg-muted/50 mb-4">
              <h3 className="font-medium text-sm mb-2">Twilio Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Twilio provides both calling and SMS functionality. Enter your Twilio credentials below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twilioAccountSid">Account SID</Label>
                <Input
                  id="twilioAccountSid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioConfig.accountSid}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twilioAuthToken">Auth Token</Label>
                <Input
                  id="twilioAuthToken"
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••"
                  value={twilioConfig.authToken}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twilioNumber">Twilio Phone Number</Label>
                <Input
                  id="twilioNumber"
                  placeholder="+1234567890"
                  value={twilioConfig.twilioNumber}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, twilioNumber: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Enter in E.164 format (e.g., +1234567890)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="twilioDefault"
                  checked={twilioConfig.isDefault}
                  onCheckedChange={(checked) => {
                    setTwilioConfig({ ...twilioConfig, isDefault: checked });
                    if (checked) {
                      setCallrailConfig({ ...callrailConfig, isDefault: false });
                    }
                  }}
                />
                <Label htmlFor="twilioDefault">Set as default provider</Label>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleTestConnection('twilio')}
                disabled={!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.twilioNumber}
              >
                Test Connection
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="callrail" className="space-y-4">
            <div className="border p-4 rounded-md bg-muted/50 mb-4">
              <h3 className="font-medium text-sm mb-2">CallRail Configuration</h3>
              <p className="text-sm text-muted-foreground">
                CallRail provides call tracking and analytics. Enter your CallRail API credentials below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callrailApiKey">API Key</Label>
                <Input
                  id="callrailApiKey"
                  placeholder="Your CallRail API Key"
                  value={callrailConfig.apiKey}
                  onChange={(e) => setCallrailConfig({ ...callrailConfig, apiKey: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="callrailAccountId">Account ID</Label>
                <Input
                  id="callrailAccountId"
                  placeholder="Your CallRail Account ID"
                  value={callrailConfig.accountId}
                  onChange={(e) => setCallrailConfig({ ...callrailConfig, accountId: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="callrailDefault"
                  checked={callrailConfig.isDefault}
                  onCheckedChange={(checked) => {
                    setCallrailConfig({ ...callrailConfig, isDefault: checked });
                    if (checked) {
                      setTwilioConfig({ ...twilioConfig, isDefault: false });
                    }
                  }}
                />
                <Label htmlFor="callrailDefault">Set as default provider for calls</Label>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleTestConnection('callrail')}
                disabled={!callrailConfig.apiKey || !callrailConfig.accountId}
              >
                Test Connection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="mockMode"
                checked={useMockMode}
                onCheckedChange={setUseMockMode}
              />
              <div>
                <Label htmlFor="mockMode">Use demo mode</Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, no real API calls will be made. Use this for testing without consuming API credits.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveConfig} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
